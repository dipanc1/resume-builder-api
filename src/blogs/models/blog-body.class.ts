import { IsArray, IsString } from 'class-validator';

export class BlogBody {
  @IsString()
  readonly title: string;

  @IsString()
  readonly content: string;

  @IsString()
  readonly image: string;

  @IsString()
  readonly description: string;

  @IsArray()
  readonly imageIds: string[];
}
