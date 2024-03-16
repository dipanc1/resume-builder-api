import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SendResumeModule } from './send-resume/send-resume.module';
import { SendJobDescriptionModule } from './send-job-description/send-job-description.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    SendResumeModule,
    SendJobDescriptionModule,
    AuthModule,
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_DEV_URI
      })
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
