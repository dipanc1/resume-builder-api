import { BadRequestException, Injectable } from '@nestjs/common';

import { Observable, catchError, firstValueFrom, from, switchMap } from 'rxjs';

import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MODELS } from 'src/constants';

import { ResumeBody } from '../models/resume-body.class';
import { SaveResume } from 'src/save-resume/models/save-resume.interface';
import { User } from 'src/auth/models/user.interface';

import { getResumeFromR2Storage } from 'src/helpers/save-resume-r2-storage';
import { AuthService } from 'src/auth/services/auth.service';

@Injectable()
export class SendResumeService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(MODELS.RESUME) private saveResumeModel: Model<SaveResume>,
    @InjectModel(MODELS.USER) private userModel: Model<User>,
    private readonly authService: AuthService
  ) {}

  sendResume(resume: ResumeBody): Observable<any> {
    if (!resume.resume)
      throw new BadRequestException('Please provide a resume.');

    return from(
      firstValueFrom(
        this.httpService
          .post(
            process.env.AGI_URL,
            {
              profile_text: resume.resume
            },
            {
              headers: {
                'X-API-KEY': process.env.API_KEY
              }
            }
          )
          .pipe(
            switchMap(async response => JSON.parse(response.data.resume)),
            catchError((error: AxiosError) => {
              console.log(error);
              throw new BadRequestException('An error happened!');
            })
          )
      )
    );
  }

  getResume(fileName: string, token: string): Observable<Uint8Array> {
    return from(this.authService.decodeToken(token)).pipe(
      switchMap(email => {
        return from(this.userModel.findOne({ email })).pipe(
          switchMap(user => {
            if (!user) {
              throw new BadRequestException('User not found');
            }

            return from(
              this.saveResumeModel.findOne({
                resumeUrl: fileName,
                userId: user._id
              })
            ).pipe(
              switchMap(resume => {
                if (!resume) {
                  throw new BadRequestException('Resume not found');
                }

                return getResumeFromR2Storage(fileName);
              })
            );
          })
        );
      })
    );
  }
}
