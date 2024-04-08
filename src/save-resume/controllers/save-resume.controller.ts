import { Body, Controller, Post } from '@nestjs/common';
import { SaveResumeService } from '../services/save-resume.service';
import { SaveResumeBody } from '../models/save-resume-body.class';
import { TemplateBody } from '../models/template-body.class';

@Controller('save-resume')
export class SaveResumeController {
  constructor(private saveResumeService: SaveResumeService) {}

  @Post()
  saveResume(@Body() saveResume: SaveResumeBody) {
    return this.saveResumeService.saveResume(saveResume);
  }

  @Post('template')
  saveTemplate(@Body() saveTemplate: TemplateBody) {
    return this.saveResumeService.saveTemplate(saveTemplate);
  }
}
