import { IsString } from 'class-validator';

export class JobDescriptionBody {
  @IsString()
  jobDescription: string;
}
