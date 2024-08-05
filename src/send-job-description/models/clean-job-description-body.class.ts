import { IsString } from 'class-validator';

export class CleanJobDescriptionBody {
  @IsString()
  jobDescription: string;
}
