import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GoogleOAuthGuard } from '../guards/google-oauth.guard';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  linkedinLogin() {
    // Redirect the user to LinkedIn for authentication.
  }

  @Get('linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  linkedinCallback(req: any, res: any) {
    // Handle the LinkedIn callback and authenticate the user.
    return res.redirect('http://localhost:3000/create');
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  GoogleLogin() {
    // Redirect the user to Google for authentication.
  }

  @Get('google-callback')
  @UseGuards(GoogleOAuthGuard)
  googleCallback(@Req() req, @Res() res) {
    // Handle the Google callback and authenticate the user.
    if (this.authService.validateUser(req.user.email)) {
      return res.redirect('http://localhost:3000/create');
    } else {
      this.authService.createUser(req.user);
      return res.redirect('http://localhost:3000/create');
    }
  }
}
