import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

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
}
