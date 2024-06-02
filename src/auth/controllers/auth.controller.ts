import {
  Controller,
  Get,
  Headers,
  Query,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { Observable, from } from 'rxjs';

import { AuthGuard } from '@nestjs/passport';

import { GoogleOAuthGuard } from '../guards/google-oauth.guard';
import { JwtGuard } from '../guards/jwt-auth.guard';
import { HeaderApiKeyGuard } from '../guards/auth-header-api-key.guard';

import { AuthService } from '../services/auth.service';

import { User } from '../models/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Get()
  @UseGuards(JwtGuard)
  user(@Headers('authorization') token: string) {
    return this.authService.getUser(token);
  }

  @Get('list')
  @UseGuards(HeaderApiKeyGuard)
  listUsers(
    @Query('pageNumber') pageNumber: string,
    @Query('pageSize') pageSize: string
  ): Observable<{
    users: User[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    const skip = parseInt(pageNumber) > 0 ? parseInt(pageNumber) - 1 : 0;
    const limit = parseInt(pageSize) > 0 ? parseInt(pageSize) : 10;
    return this.authService.listUsers(skip, limit);
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
