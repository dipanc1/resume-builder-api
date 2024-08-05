import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { Observable } from 'rxjs';

import { SendJobDescriptionService } from '../services/send-job-description.service';

import { JobDescriptionBody } from '../models/job-description-body.class';
import { CleanJobDescriptionBody } from '../models/clean-job-description-body.class';
import { ResumeBody } from 'src/send-resume/models/resume-body.class';

@Controller('send-job-description')
export class SendJobDescriptionController {
  constructor(
    private readonly sendJobDescriptionService: SendJobDescriptionService
  ) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  sendJobDescription(
    @Body() jobDescription: JobDescriptionBody
  ): Observable<ResumeBody> {
    return this.sendJobDescriptionService.sendJobDescription(jobDescription);
  }

  @Post('get-clean-job-description-text')
  @HttpCode(200)
  getCleanJobDescriptionText(
    @Body() jobDescription: CleanJobDescriptionBody
  ): Observable<string> {
    return this.sendJobDescriptionService.getCleanJobDescriptionText(
      jobDescription
    );
  }
}
