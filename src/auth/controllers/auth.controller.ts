import { Controller, Get, Headers, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GoogleOAuthGuard } from '../guards/google-oauth.guard';
import { AuthService } from '../services/auth.service';
import { JwtGuard } from '../guards/jwt-auth.guard';
import { from } from 'rxjs';

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
  googleCallback(@Req() req: any, @Res() res: any) {
    // Handle the Google callback and authenticate the user.
    const url = `${process.env.REDIRECT_URI}/authenticate?token=`;

    from(this.authService.validateUser(req.user.email)).subscribe(
      existingUser => {
        if (!existingUser) {
          this.authService.createUser(req.user).subscribe(() => {
            this.authService.oAuthLogin(req.user).subscribe(token => {
              res.redirect(url + token);
            });
          });
        }
        this.authService.oAuthLogin(req.user).subscribe(token => {
          res.redirect(url + token);
        });
      }
    );
  }
}
