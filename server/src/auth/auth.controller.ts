import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { IntraSigninDto } from './dto/intra-signin.dto';
import { SigninResponseDto } from './dto/signin-response';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('intra/signin')
  @ApiOperation({
    summary:
      'Sign in user through 42 Intra API. Receives a 42 Intra code as input. Retrieves user data from 42 Intra API and creates a new user in the database if needed.',
  })
  @ApiOkResponse({
    description:
      'Returns user data from database. Either existing or new user.',
    type: SigninResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'State value does not match or provided code is invalid.',
  })
  @HttpCode(HttpStatus.OK)
  signinUser(
    @Body() intraSigninDto: IntraSigninDto,
  ): Promise<SigninResponseDto> {
    let { code, state } = intraSigninDto;
    return this.authService.signinUser(code, state);
  }
}
