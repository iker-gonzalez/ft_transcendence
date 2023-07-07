import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IntraSigninDto } from './dto/intra-signin.dto';
import { IntraUserDataDto } from './dto/intra-user-data.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('intra/signin')
  signinUser(
    @Body() intraSigninDto: IntraSigninDto,
  ): Promise<IntraUserDataDto> {
    let { code, state } = intraSigninDto;
    return this.authService.signinUser(code, state);
  }
}
