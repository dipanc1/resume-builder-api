import { Module } from '@nestjs/common';

import { SendResumeController } from './controllers/send-resume.controller';
import { SendResumeService } from './services/send-resume.service';

import { HttpModule } from '@nestjs/axios';

import { MongooseModule } from '@nestjs/mongoose';

import { MODELS } from 'src/constants';

import { SaveResumeSchema } from 'src/save-resume/schemas/save-resume.schema';
import { UserSchema } from 'src/auth/schemas/user.schema';

import { AuthService } from 'src/auth/services/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: MODELS.RESUME, schema: SaveResumeSchema },
      { name: MODELS.USER, schema: UserSchema }
    ])
  ],
  controllers: [SendResumeController],
  providers: [SendResumeService, AuthService, JwtService]
})
export class SendResumeModule {}
