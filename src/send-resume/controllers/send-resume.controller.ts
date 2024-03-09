import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UploadedFile,
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
let reader = require('any-text');

@Controller('send-resume')
export class SendResumeController {
  constructor(private readonly sendResumeService: SendResumeService) {}

  @Post()
  @HttpCode(200)
  sendResume(@Body() resume: ResumeBody): Observable<any> {
    return this.sendResumeService.sendResume(resume);
  }

  @Post('get-generated-resume')
  @HttpCode(200)
  sendGeneratedResume(@Body() resume: ResumeBody): Observable<any> {
    return this.sendResumeService.sendGeneratedResume(resume);
  }

  @Post('upload')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('resume', saveResumeToStorage))
  uploadResume(@UploadedFile() resume: Express.Multer.File): Observable<any> {
    const fileName = resume?.filename;

    if (!fileName) {
      return of({
        error: 'File must be a PDF or DOCX file!'
      });
    }

    const fileSize = resume?.size;

    if (isFileSizeLessThanOneMB(fileSize))
      return of({ error: 'File size too large!' });

    const uploadsFolderPath = join(process.cwd(), 'uploads');
    const fullFilePath = join(uploadsFolderPath, '/' + resume.filename);

    return isFileExtensionSafe(fullFilePath).pipe(
      switchMap((isFileExtensionSafe: boolean) => {
        if (isFileExtensionSafe) {
          return of(reader.getText(fullFilePath));
        }
        removeFile(fullFilePath);
        return of({
          error: 'File content does not match the file extension!'
        });
      })
    );
  }
}
