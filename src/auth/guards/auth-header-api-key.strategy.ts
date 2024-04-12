import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import Strategy from 'passport-headerapikey';

@Injectable()
export class HeaderApiKeyStrategy extends PassportStrategy(
  Strategy,
  'api-key'
) {
  constructor(private readonly configService: ConfigService) {
    super({ header: 'API-KEY', prefix: '' }, true, async (apiKey, done) => {
      return this.validate(apiKey, done);
    });
  }

  public validate = (
    apiKey: string,
    done: (error: Error, data: any) => any
  ) => {
    const validApiKey = this.configService.get<string>('OWN_API_KEY');
    if (apiKey === validApiKey) {
      return done(null, true);
    }
    return done(new UnauthorizedException(), false);
  };
}
