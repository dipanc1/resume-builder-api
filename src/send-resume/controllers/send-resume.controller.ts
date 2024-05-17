import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { join } from 'path';
import { SendResumeService } from '../services/send-resume.service';
import { Observable, from, map, switchMap } from 'rxjs';
import { ResumeBody } from '../models/resume-body.class';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  isFileExtensionSafe,
  isFileSizeLessThanOneMB,
  removeFile
} from 'src/helpers/resume-storage';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ResumeTextBody } from '../models/resume-text-body.class';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  getResumeFromR2Storage,
  saveResumeToR2Storage
} from 'src/helpers/save-resume-r2-storage';

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

  @Post('upload')
  @HttpCode(200)
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

  @Get(':fileName')
  @UseGuards(JwtGuard)
  getResumeText(@Param() params: { fileName: string }): Observable<Uint8Array> {
    const fileName = params.fileName;
    return getResumeFromR2Storage(fileName);
  }
}
