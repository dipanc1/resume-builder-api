import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards
} from '@nestjs/common';
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
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  sendJobDescription(
    @Body() jobDescription: JobDescriptionBody
  ): Observable<ResumeBody> {
    return this.sendJobDescriptionService.sendJobDescription(jobDescription);
  }

  @Post('get-clean-job-description-text')
  @HttpCode(HttpStatus.OK)
  getCleanJobDescriptionText(
    @Body() jobDescription: CleanJobDescriptionBody
  ): Observable<string> {
    return this.sendJobDescriptionService.getCleanJobDescriptionText(
      jobDescription
    );
  }
}
