import { Module } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { MongooseModule } from '@nestjs/mongoose';

import { MODELS } from 'src/constants';

import { SaveResumeSchema } from './schemas/save-resume.schema';
import { TemplateSchema } from './schemas/template.schema';
import { UserSchema } from 'src/auth/schemas/user.schema';

import { SaveResumeService } from './services/save-resume.service';
import { AuthService } from 'src/auth/services/auth.service';

import { SaveResumeController } from './controllers/save-resume.controller';

import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MODELS.RESUME, schema: SaveResumeSchema },
      { name: MODELS.TEMPLATE, schema: TemplateSchema },
      { name: MODELS.USER, schema: UserSchema }
    ]),
    AuthModule
  ],
  controllers: [SaveResumeController],
  providers: [SaveResumeService, AuthService, JwtService]
})
export class SaveResumeModule {}
