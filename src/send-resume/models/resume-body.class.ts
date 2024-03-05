import { IsString } from "class-validator";

export class ResumeBody {
  @IsString()
  resume: string;
}
