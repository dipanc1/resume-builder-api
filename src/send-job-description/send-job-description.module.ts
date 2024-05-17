import { Module } from '@nestjs/common';

import { HttpModule } from '@nestjs/axios';

import { SendJobDescriptionService } from './services/send-job-description.service';
import { SendJobDescriptionController } from './controllers/send-job-description.controller';

@Module({
  imports: [HttpModule],
  controllers: [SendJobDescriptionController],
  providers: [SendJobDescriptionService]
})
export class SendJobDescriptionModule {}
