import { IsEmail, IsString } from 'class-validator';

export class UserBody {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  role: string;
}
