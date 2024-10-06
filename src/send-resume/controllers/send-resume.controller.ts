import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ThrottlerGuard } from '@nestjs/throttler';

import { join } from 'path';
import { Observable, from, map, switchMap } from 'rxjs';

import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';

import {
  isFileExtensionSafe,
  isFileSizeLessThanOneMB,
  removeFile
} from 'src/helpers/resume-storage';
import { saveResumeToR2Storage } from 'src/helpers/r2-storage';

import { ResumeTextBody } from '../models/resume-text-body.class';
import { ResumeBody } from '../models/resume-body.class';

import { SendResumeService } from '../services/send-resume.service';

import { ResumeSectionBody } from '../models/resume-section-body.class';
import { Section } from '../models/section.class';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const reader = require('any-text');

@Controller('send-resume')
export class SendResumeController {
  constructor(private readonly sendResumeService: SendResumeService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  sendResume(@Body() resume: ResumeBody): Observable<any> {
    return this.sendResumeService.sendResume(resume);
  }

  @Post('generate-resume-section/:section')
  @UseGuards(ThrottlerGuard)
  sendResumeSection(
    @Body() resumeSectionBody: ResumeSectionBody,
    @Param('section') section: Section
  ): Observable<any> {
    return this.sendResumeService.sendResumeSection(section, resumeSectionBody);
  }

  @Post('get-clean-resume-text')
  @HttpCode(HttpStatus.OK)
  getCleanResumeText(@Body() resume: ResumeBody): Observable<string> {
    return this.sendResumeService.getCleanResumeText(resume);
  }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('resume'))
  uploadResume(
    @UploadedFile() resume: Express.Multer.File
  ): Observable<ResumeTextBody | { error: string }> {
    const fileName = resume.originalname;

    if (!fileName) {
      throw new BadRequestException('File name is required!');
    }

    const fileSize = resume?.size;

    if (isFileSizeLessThanOneMB(fileSize))
      throw new BadRequestException('File size must be less than 1MB!');

    const uploadsFolderPath = join(process.cwd(), 'uploads');

    return saveResumeToR2Storage(resume).pipe(
      switchMap(name => {
        const fullFilePath = join(uploadsFolderPath, '/' + name);

        return isFileExtensionSafe(fullFilePath).pipe(
          switchMap((isFileExtensionSafe: boolean) => {
            if (isFileExtensionSafe) {
              return from(reader.getText(fullFilePath)).pipe(
                map((text: string) => {
                  removeFile(fullFilePath);
                  return {
                    url: `${name}`,
                    text: text
                  };
                })
              );
            }
            removeFile(fullFilePath);
            throw new BadRequestException(
              'File content does not match the file extension!'
            );
          })
        );
      })
    );
  }

  @Get('get/:fileName')
  @UseGuards(JwtGuard)
  getResume(
    @Param() params: { fileName: string },
    @Headers('authorization') token: string
  ): Observable<boolean> {
    // Changed in commit id: 2e32ac5a23dde0a82de459e21b5976d52e5b5394
    const fileName = params.fileName;
    return this.sendResumeService.getResume(fileName, token);
  }
}
