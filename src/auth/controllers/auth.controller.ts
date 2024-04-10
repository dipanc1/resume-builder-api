import { Controller, Get, Headers, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GoogleOAuthGuard } from '../guards/google-oauth.guard';
import { AuthService } from '../services/auth.service';
import { JwtGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Get()
  @UseGuards(JwtGuard)
  user(@Headers('authorization') token: string) {
    return this.authService.getUser(token);
  }

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
  async googleCallback(@Req() req, @Res() res) {
    // Handle the Google callback and authenticate the user.
    const token = await this.authService.oAuthLogin(req.user);
    if (this.authService.validateUser(req.user.email)) {
      return res.redirect('http://localhost:3000/create?token=' + token.jwt);
    } else {
      this.authService.createUser(req.user);
      return res.redirect('http://localhost:3000/create?token=' + token.jwt);
    }
  }
}
