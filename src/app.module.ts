import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SendResumeModule } from './send-resume/send-resume.module';
import { SendJobDescriptionModule } from './send-job-description/send-job-description.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    SendResumeModule,
    SendJobDescriptionModule,
    AuthModule,
    ThrottlerModule.forRoot([
      {
        ttl: 600000,
        limit: 5
      }
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client')
    }),
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
