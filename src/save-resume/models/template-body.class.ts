import { IsNotEmpty, IsString } from 'class-validator';

export class TemplateBody {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  user: string;
}
