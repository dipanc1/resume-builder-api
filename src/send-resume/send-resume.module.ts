import { Module } from '@nestjs/common';
import { SendResumeController } from './controllers/send-resume.controller';
import { SendResumeService } from './services/send-resume.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [SendResumeController],
  providers: [SendResumeService]
})
export class SendResumeModule {}
