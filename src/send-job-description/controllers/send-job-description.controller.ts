import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { JobDescriptionBody } from '../models/job-description-body.class';
import { Observable } from 'rxjs';
import { SendJobDescriptionService } from '../services/send-job-description.service';

@Controller('send-job-description')
export class SendJobDescriptionController {
  constructor(
    private readonly sendJobDescriptionService: SendJobDescriptionService
  ) {}

  @Post()
  @HttpCode(200)
  sendJobDescription(
    @Body() jobDescription: JobDescriptionBody
  ): Observable<any> {
    return this.sendJobDescriptionService.sendJobDescription(jobDescription);
  }
}
