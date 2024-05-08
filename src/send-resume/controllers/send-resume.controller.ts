import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  StreamableFile,
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
import { ResumeTextBody } from '../models/resume-text-body.class';
import { createReadStream } from 'fs';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
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
  ): Observable<ResumeTextBody | { error: string }> {
    const fileName = resume?.filename;

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
          return of({
            url: `${process.env.DOWNLOAD_UPLOADED_RESUME}/${fileName}`,
            text: reader.getText(fullFilePath)
          });
        }
        removeFile(fullFilePath);
        throw new BadRequestException(
          'File content does not match the file extension!'
        );
      })
    );
  }

  @Get(':fileName')
  @UseGuards(JwtGuard)
  getResumeText(
    @Param() params: { fileName: string }
  ): Observable<StreamableFile> {
    const fileName = params.fileName;
    const filePath = createReadStream(join(process.cwd(), 'uploads', fileName));
    return of(new StreamableFile(filePath));
  }
}
