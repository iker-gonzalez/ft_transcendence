import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IntraSigninDto } from './dto/intra-signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('intra/signin')
  signinUser(@Body() IntraSigninDto: IntraSigninDto): string {
    let { code, state } = IntraSigninDto;
    return this.authService.signinUser(code, state);
  }
}
