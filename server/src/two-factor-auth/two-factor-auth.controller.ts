import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { swaggerConstants } from '../../config/swagger.constants';
import { ActivateOtpDto } from './dto/activate-otp.dto';
import { ActivateOtpResponseDto } from './dto/activate-otp-response.dto';

@ApiTags('2FA')
@Controller('2fa')
@UseGuards(JwtGuard)
export class TwoFactorAuthController {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

  @Post('generate')
  @ApiOperation({
    summary: swaggerConstants.twofa.generate.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.twofa.generate.ok.description,
  })
  @ApiUnauthorizedResponse({
    description: swaggerConstants.twofa.generate.unauthorized.description,
  })
  @HttpCode(HttpStatus.OK)
  async generateQr(
    @Res() response: Response,
    @GetUser() user: User,
  ): Promise<any> {
    const otpauthUrlDto =
      await this.twoFactorAuthService.generateTwoFactorAuthenticationSecret(
        user,
      );

    return this.twoFactorAuthService.pipeQrCodeStream(response, otpauthUrlDto);
  }

  @Post('activate')
  @ApiOperation({
    summary: swaggerConstants.twofa.activate.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.twofa.activate.ok.description,
    type: ActivateOtpResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: swaggerConstants.twofa.activate.unauthorized.description,
  })
  @ApiBadRequestResponse({
    description: swaggerConstants.twofa.activate.bad.description,
  })
  @HttpCode(HttpStatus.OK)
  async turnOnTwoFactorAuthentication(
    @GetUser() user: User,
    @Body() activateOtpDto: ActivateOtpDto,
  ): Promise<ActivateOtpResponseDto> {
    return this.twoFactorAuthService.activaTwoFactorAuthentication(
      activateOtpDto,
      user,
    );
  }

  @Delete('deactivate')
  @ApiOperation({
    summary: swaggerConstants.twofa.deactivate.summary,
  })
  @ApiOkResponse({
    description: swaggerConstants.twofa.deactivate.ok.description,
    type: ActivateOtpResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: swaggerConstants.twofa.deactivate.unauthorized.description,
  })
  @ApiBadRequestResponse({
    description: swaggerConstants.twofa.deactivate.bad.description,
  })
  async turnOffTwoFactorAuthentication(
    @GetUser() user: User,
    @Body() deactivateOtpDto: ActivateOtpDto,
  ): Promise<ActivateOtpResponseDto> {
    return this.twoFactorAuthService.deactivateTwoFactorAuthentication(
      deactivateOtpDto,
      user,
    );
  }
}
