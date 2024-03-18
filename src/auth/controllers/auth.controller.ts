import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GoogleOAuthGuard } from '../guards/google-oauth.guard';

@Controller('auth')
export class AuthController {
  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  linkedinLogin() {
    // Redirect the user to LinkedIn for authentication.
  }

  @Get('linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  linkedinCallback(req: any, res: any) {
    // Handle the LinkedIn callback and authenticate the user.
    return res.redirect('http://localhost:3001/create');
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  GoogleLogin() {
    // Redirect the user to Google for authentication.
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  googleCallback(req: any, res: any) {
    // Handle the Google callback and authenticate the user.
    return res.redirect('http://localhost:3001/create');
  }
}
