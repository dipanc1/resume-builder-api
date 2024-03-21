import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { join } from 'path';
import { SendResumeService } from '../services/send-resume.service';
import { Observable, of, switchMap } from 'rxjs';
import { ResumeBody } from '../models/resume-body.class';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  isFileExtensionSafe,
  isFileSizeLessThanOneMB,
  removeFile,
  saveResumeToStorage
} from 'src/helpers/resume-storage';
import { ThrottlerGuard } from '@nestjs/throttler';
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
  @UseInterceptors(FileInterceptor('resume', saveResumeToStorage))
  uploadResume(
    @UploadedFile() resume: Express.Multer.File
  ): Observable<string | { error: string }> {
    const fileName = resume?.filename;
    console.log('fileName', fileName);

    if (!fileName) {
      throw new BadRequestException('File must be a PDF or DOCX file!');
    }

    const fileSize = resume?.size;

    if (isFileSizeLessThanOneMB(fileSize))
      throw new BadRequestException('File size must be less than 1MB!');

    const uploadsFolderPath = join(process.cwd(), 'uploads');
    const fullFilePath = join(uploadsFolderPath, '/' + resume.filename);

    return isFileExtensionSafe(fullFilePath).pipe(
      switchMap((isFileExtensionSafe: boolean) => {
        if (isFileExtensionSafe) {
          return of(reader.getText(fullFilePath));
        }
        removeFile(fullFilePath);
        throw new BadRequestException(
          'File content does not match the file extension!'
        );
      })
    );
  }
}
