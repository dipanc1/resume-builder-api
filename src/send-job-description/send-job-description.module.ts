import { Module } from '@nestjs/common';
import { SendJobDescriptionService } from './services/send-job-description.service';
import { SendJobDescriptionController } from './controllers/send-job-description.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [SendJobDescriptionController],
  providers: [SendJobDescriptionService]
})
export class SendJobDescriptionModule {}
