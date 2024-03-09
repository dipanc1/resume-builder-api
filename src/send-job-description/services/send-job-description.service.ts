import { Injectable } from '@nestjs/common';
import { Observable, catchError, firstValueFrom, from, switchMap } from 'rxjs';
import { JobDescriptionBody } from '../models/job-description-body.class';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
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
              console.log(error);
              throw 'An error happened!';
            })
          )
      )
    );
  }
}
