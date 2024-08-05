import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import {
  Observable,
  catchError,
  firstValueFrom,
  from,
  of,
  switchMap
} from 'rxjs';

import { AxiosError } from 'axios';

import { HttpService } from '@nestjs/axios';

import { JobDescriptionBody } from '../models/job-description-body.class';
import { ResumeBody } from 'src/send-resume/models/resume-body.class';
import { CleanJobDescriptionBody } from '../models/clean-job-description-body.class';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cheerio = require('cheerio');

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

  getCleanJobDescriptionText(
    body: CleanJobDescriptionBody
  ): Observable<string> {
    const { jobDescription } = body;

    const $ = cheerio.load(jobDescription, {
      scriptingEnabled: false,
      sourceCodeLocationInfo: false,
      decodeEntities: false
    });

    const text = $.text()
      .replace(/\s+/g, ' ')
      .replace(/<script.*?<\/script>/g, '')
      .replace(/<style.*?<\/style>/g, '')
      .replace(/<.*?>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&cent;/g, '¢')
      .replace(/&pound;/g, '£')
      .replace(/&yen;/g, '¥')
      .replace(/&euro;/g, '€')
      .replace(/&copy;/g, '©')
      .replace(/&reg;/g, '®')
      .replace(/&trade;/g, '™')
      .replace(/&times;/g, '×')
      .replace(/&divide;/g, '÷')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/&hellip;/g, '…')
      .replace(/&laquo;/g, '«')
      .replace(/&raquo;/g, '»')
      .replace(/&ldquo;/g, '“')
      .replace(/&rdquo;/g, '”')
      .replace(/&lsquo;/g, '‘')
      .replace(/&rsquo;/g, '’')
      .replace(/&sbquo;/g, '‚')
      .replace(/&bdquo;/g, '„')
      .replace(/\[.*?\}\s/g, '')
      .replace(/@.*?;/g, '')
      .replace(/\{.*?\}/g, '')
      .replace(/!function.*?\} } }/g, '')
      .replace(/}/g, '')
      .replace(/ ,/g, ',');

    return of(text);
  }
}
