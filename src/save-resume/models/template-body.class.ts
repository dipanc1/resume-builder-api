import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class TemplateBody {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsOptional()
  user: string;
}
