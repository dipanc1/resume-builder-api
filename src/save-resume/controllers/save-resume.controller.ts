import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';

import { Observable } from 'rxjs';

import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { HeaderApiKeyGuard } from 'src/auth/guards/auth-header-api-key.guard';

import { SaveResumeService } from '../services/save-resume.service';

import { SaveResumeBody } from '../models/save-resume-body.class';
import { TemplateBody } from '../models/template-body.class';

import { Template } from '../models/template.interface';
import { SaveResume } from '../models/save-resume.interface';

import { ResponseDto } from 'src/helpers/common/response.dto';

@Controller('save-resume')
export class SaveResumeController {
  constructor(private saveResumeService: SaveResumeService) {}

  @Post()
  @UseGuards(JwtGuard)
  saveResume(
    @Body() saveResume: SaveResumeBody,
    @Headers('authorization') token: string
  ): Observable<SaveResume | BadRequestException> {
    return this.saveResumeService.saveResume(saveResume, token);
  }

  @Get(':resumeId')
  @UseGuards(JwtGuard)
  getResume(
    @Param('resumeId') resumeId: string,
    @Headers('authorization') token: string
  ): Observable<SaveResume | BadRequestException> {
    return this.saveResumeService.getResume(resumeId, token);
  }

  @Put(':resumeId')
  @UseGuards(JwtGuard)
  updateResume(
    @Param('resumeId') resumeId: string,
    @Body() saveResume: SaveResumeBody,
    @Headers('authorization') token: string
  ): Observable<SaveResume | BadRequestException> {
    return this.saveResumeService.updateResume(resumeId, saveResume, token);
  }

  @Delete(':resumeId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteResume(
    @Param('resumeId') resumeId: string,
    @Headers('authorization') token: string
  ): Observable<ResponseDto | BadRequestException> {
    return this.saveResumeService.deleteResume(resumeId, token);
  }

  @Get('resumes/getAll')
  @UseGuards(JwtGuard)
  getAllResumes(
    @Headers('authorization') token: string
  ): Observable<SaveResume[] | BadRequestException> {
    return this.saveResumeService.getAllResumes(token);
  }

  @Post('template')
  @UseGuards(HeaderApiKeyGuard)
  saveTemplate(
    @Body() saveTemplate: TemplateBody
  ): Observable<Template | BadRequestException> {
    return this.saveResumeService.saveTemplate(saveTemplate);
  }

  @Get('template/getAll')
  getTemplates(): Observable<Template[] | BadRequestException> {
    return this.saveResumeService.getTemplates();
  }

  @Get('template/myTemplates')
  @UseGuards(JwtGuard)
  getTemplate(
    @Headers('authorization') token: string
  ): Observable<Template[] | BadRequestException> {
    return this.saveResumeService.getTemplate(token);
  }

  @Put('template/purchase/:templateId')
  @UseGuards(JwtGuard)
  purchaseTemplate(
    @Param('templateId') templateId: string,
    @Headers('authorization') token: string
  ): Observable<Template | BadRequestException> {
    return this.saveResumeService.purchaseTemplate(templateId, token);
  }
}
