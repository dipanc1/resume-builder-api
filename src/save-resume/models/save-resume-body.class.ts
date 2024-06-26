import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SaveResumeBody {
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  data: string;

  @IsString()
  @IsNotEmpty()
  rawData: string;

  @IsString()
  @IsOptional()
  resumeUrl: string;
}
