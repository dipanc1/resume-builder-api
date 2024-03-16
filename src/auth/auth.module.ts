import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { LinkedINStrategy } from './guards/linkedin.strategy';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { MODELS } from 'src/constants';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'linkedin' }),
    MongooseModule.forFeature([{ name: MODELS.USER_MODEL, schema: UserSchema }])
  ],
  controllers: [AuthController],
  providers: [LinkedINStrategy, AuthService]
})
export class AuthModule {}
