import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UseGuards
} from '@nestjs/common';
import { SaveResumeService } from '../services/save-resume.service';
import { SaveResumeBody } from '../models/save-resume-body.class';
import { TemplateBody } from '../models/template-body.class';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('save-resume')
export class SaveResumeController {
  constructor(private saveResumeService: SaveResumeService) {}

  @Post()
  @UseGuards(JwtGuard)
  saveResume(
    @Body() saveResume: SaveResumeBody,
    @Headers('authorization') token: string
  ) {
    return this.saveResumeService.saveResume(saveResume, token);
  }

  @Get(':resumeId')
  @UseGuards(JwtGuard)
  getResume(
    @Param('resumeId') resumeId: string,
    @Headers('authorization') token: string
  ) {
    return this.saveResumeService.getResume(resumeId, token);
  }

  @Post('template')
  saveTemplate(@Body() saveTemplate: TemplateBody) {
    return this.saveResumeService.saveTemplate(saveTemplate);
  }
}
