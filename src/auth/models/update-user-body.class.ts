import { IsEmail, IsString } from 'class-validator';
import { Role } from 'src/helpers/role.enum';

export class UpdateUserBody {
  @IsEmail()
  email: string;

  @IsString()
  role: Role;
}
