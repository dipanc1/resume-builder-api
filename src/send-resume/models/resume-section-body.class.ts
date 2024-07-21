import { IsString } from 'class-validator';
import { ResumeBody } from './resume-body.class';

export class ResumeSectionBody extends ResumeBody {
  @IsString()
  prompt: string;
}
