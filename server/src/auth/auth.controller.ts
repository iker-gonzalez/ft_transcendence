import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IntraSigninDto } from './dto/intra-signin.dto';
import { SigninResponseDto } from './dto/signin-response';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { swaggerConstants } from '../../config/swagger.constants';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('intra/signin')
  @ApiOperation({
    summary: swaggerConstants.auth.signin.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.auth.signin.ok.description,
    type: SigninResponseDto,
  })
  @ApiBadRequestResponse({
    description: swaggerConstants.auth.signin.bad.description,
  })
  @ApiUnauthorizedResponse({
    description: swaggerConstants.auth.signin.unauthorized.description,
  })
  @HttpCode(HttpStatus.OK)
  signinUser(
    @Body() intraSigninDto: IntraSigninDto,
  ): Promise<SigninResponseDto> {
    let { code, state, otp } = intraSigninDto;
    return this.authService.signinUser(code, state, otp);
  }
}
