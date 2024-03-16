import { BadRequestException, Injectable } from '@nestjs/common';
import { Observable, catchError, firstValueFrom, from, switchMap } from 'rxjs';
import { ResumeBody } from '../models/resume-body.class';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';

@Injectable()
export class SendResumeService {
  constructor(private readonly httpService: HttpService) {}

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
}
