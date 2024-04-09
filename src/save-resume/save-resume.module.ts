import { Module } from '@nestjs/common';
import { SaveResumeController } from './controllers/save-resume.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MODELS } from 'src/constants';
import { SaveResumeSchema } from './schema/save-resume.schema';
import { TemplateSchema } from './schema/template.schema';
import { SaveResumeService } from './services/save-resume.service';
import { UserSchema } from 'src/auth/schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/services/auth.service';
import { JwtService } from '@nestjs/jwt';

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
