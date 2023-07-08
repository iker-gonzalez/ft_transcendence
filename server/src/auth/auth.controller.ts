import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IntraSigninDto } from './dto/intra-signin.dto';
import { SigninResponseDto } from './dto/signin-response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('intra/signin')
  @HttpCode(200)
  signinUser(
    @Body() intraSigninDto: IntraSigninDto,
  ): Promise<SigninResponseDto> {
    let { code, state } = intraSigninDto;
    return this.authService.signinUser(code, state);
  }
}
