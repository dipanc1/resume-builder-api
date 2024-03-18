import { Injectable } from '@nestjs/common';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';

@Injectable()
export class GooglePassportStrategy extends PassportStrategy(GoogleStrategy) {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile']
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any
  ) {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      refreshToken
    };

    const existingUser = await this.authService.validateUser(user.email);

    if (!existingUser) {
      await this.authService.createUser(user);
    }
    done(null, user);
  }
}
