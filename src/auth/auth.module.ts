import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';

import { LinkedInPassportStrategy } from './guards/linkedin.strategy';
import { GooglePassportStrategy } from './guards/google.strategy';

import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';

import { UserSchema } from './schemas/user.schema';

import { MODELS } from 'src/constants';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './guards/jwt-auth.guard';
import { JwtGuardStrategy } from './guards/jwt-auth.strategy';
import { HeaderApiKeyStrategy } from './guards/auth-header-api-key.strategy';
import { RoleGuard } from './guards/role.guard';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([{ name: MODELS.USER, schema: UserSchema }]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: '3600s'
        },
        global: true
      })
    })
  ],
  controllers: [AuthController],
  providers: [
    LinkedInPassportStrategy,
    GooglePassportStrategy,
    HeaderApiKeyStrategy,
    JwtGuardStrategy,
    JwtGuard,
    RoleGuard,
    AuthService
  ]
})
export class AuthModule {}
