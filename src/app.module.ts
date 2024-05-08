import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { SendResumeModule } from './send-resume/send-resume.module';
import { SendJobDescriptionModule } from './send-job-description/send-job-description.module';
import { AuthModule } from './auth/auth.module';
import { SaveResumeModule } from './save-resume/save-resume.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 600000,
        limit: 50
      }
    ]),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URI
      })
    }),

    SendResumeModule,
    SendJobDescriptionModule,
    AuthModule,
    SaveResumeModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
