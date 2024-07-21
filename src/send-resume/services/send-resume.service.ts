import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import {
  Observable,
  catchError,
  firstValueFrom,
  from,
  of,
  switchMap,
  map
} from 'rxjs';

import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { endPoints, MODELS, ports } from 'src/constants';

import { ResumeBody } from '../models/resume-body.class';
import { ResumeSectionBody } from '../models/resume-section-body.class';

import { SaveResume } from 'src/save-resume/models/save-resume.interface';
import { User } from 'src/auth/models/user.interface';

import { AuthService } from 'src/auth/services/auth.service';
import { Section } from '../models/section.class';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cheerio = require('cheerio');

@Injectable()
export class SendResumeService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(MODELS.RESUME) private saveResumeModel: Model<SaveResume>,
    @InjectModel(MODELS.USER) private userModel: Model<User>,
    private readonly authService: AuthService
  ) {}

  sendResume(resumeBody: ResumeBody): Observable<any> {
    const { resume } = resumeBody;
    if (!resume) throw new BadRequestException('Please provide a resume.');

    const url = `${process.env.AGI_URL}:${ports.AGI}/${endPoints.GENERATE_RESUME}`;

    const headers = {
      'X-API-KEY': process.env.API_KEY
    };

    const body = {
      profile_text: resume
    };

    return from(
      firstValueFrom(
        this.httpService
          .post(url, body, {
            headers
          })
          .pipe(
            map(async response => response.data.resume),
            catchError((error: AxiosError) => {
              Logger.log(error);
              throw new BadRequestException('An error happened!');
            })
          )
      )
    );
  }

  sendResumeSection(
    section: Section,
    resumeSection: ResumeSectionBody
  ): Observable<any> {
    const { resume, prompt } = resumeSection;
    if (!resume || !prompt || !section)
      throw new BadRequestException(
        'Please provide resume, prompt and section.'
      );

    const url = `${process.env.AGI_URL}:${ports.AGI_SECTION}/${endPoints.GENERATE_RESUME_SECTION}`;

    const body = {
      profile_text: resume,
      section,
      prompt
    };

    const headers = {
      'X-API-KEY': process.env.API_KEY
    };

    return from(
      firstValueFrom(
        this.httpService
          .post(url, body, {
            headers
          })
          .pipe(
            map(async response => response.data[`${section}`][`${section}`]),
            catchError((error: AxiosError) => {
              Logger.log(error);
              throw new BadRequestException('An error happened!');
            })
          )
      )
    );
  }

  getResume(fileName: string, token: string): Observable<boolean> {
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

                return of(!!resume);
              })
            );
          })
        );
      })
    );
  }

  getCleanResumeText(body: ResumeBody): Observable<string> {
    const { resume } = body;

    const $ = cheerio.load(resume, {
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
      .replace(/urn:li:page:d_flagship3_profile_view_base/g, '')
      .replace(/ ,/g, ',')
      .replace(/,/g, ', ');

    return of(text);
  }
}
