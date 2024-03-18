import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';

import { LinkedInPassportStrategy } from './guards/linkedin.strategy';
import { GooglePassportStrategy } from './guards/google.strategy';

import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';

import { UserSchema } from './schemas/user.schema';

import { MODELS } from 'src/constants';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([{ name: MODELS.USER_MODEL, schema: UserSchema }])
  ],
  controllers: [AuthController],
  providers: [LinkedInPassportStrategy, GooglePassportStrategy, AuthService]
})
export class AuthModule {}
