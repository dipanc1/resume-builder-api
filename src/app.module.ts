import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SendResumeModule } from './send-resume/send-resume.module';
import { SendJobDescriptionModule } from './send-job-description/send-job-description.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    SendResumeModule,
    SendJobDescriptionModule,
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
