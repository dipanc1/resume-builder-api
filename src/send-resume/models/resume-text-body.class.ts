import { IsString } from 'class-validator';

export class ResumeTextBody {
  @IsString()
  url: string;

  @IsString()
  text: string;
}
