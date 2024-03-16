import { Injectable } from '@nestjs/common';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LinkedINStrategy extends PassportStrategy(LinkedInStrategy) {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/linkedin/callback',
      scope: ['r_emailaddress', 'r_liteprofile']
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any
  ) {
    const user = {
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value
    };

    const existingUser = await this.authService.validateUser(user.email);

    if (!existingUser) {
      await this.authService.createUser(user);
    }
    done(null, user);
  }
}
