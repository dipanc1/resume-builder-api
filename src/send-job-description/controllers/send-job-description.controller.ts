import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JobDescriptionBody } from '../models/job-description-body.class';
import { Observable } from 'rxjs';
import { SendJobDescriptionService } from '../services/send-job-description.service';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('send-job-description')
export class SendJobDescriptionController {
  constructor(
    private readonly sendJobDescriptionService: SendJobDescriptionService
  ) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  sendJobDescription(
    @Body() jobDescription: JobDescriptionBody
  ): Observable<any> {
    return this.sendJobDescriptionService.sendJobDescription(jobDescription);
  }
}
