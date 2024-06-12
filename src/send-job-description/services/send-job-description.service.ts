import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { Observable, catchError, firstValueFrom, from, switchMap } from 'rxjs';

import { AxiosError } from 'axios';

import { HttpService } from '@nestjs/axios';

import { JobDescriptionBody } from '../models/job-description-body.class';
import { ResumeBody } from 'src/send-resume/models/resume-body.class';

@Injectable()
export class SendJobDescriptionService {
  constructor(private readonly httpService: HttpService) {}

  sendJobDescription(
    jobDescription: JobDescriptionBody
  ): Observable<ResumeBody> {
    return from(
      firstValueFrom(
        this.httpService
          .post<ResumeBody>(
            process.env.AGI_URL,
            {
              job_description: jobDescription.jobDescription,
              profile_text: jobDescription.resume
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
              Logger.log(error);
              throw new BadRequestException('An error happened!');
            })
          )
      )
    );
  }
}
