import {
  Body,
  Controller,
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
import { PrismaService } from '../prisma/prisma.service';
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
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly prisma: PrismaService,
  ) {}

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
  @UseGuards(JwtGuard)
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
  @UseGuards(JwtGuard)
  async turnOnTwoFactorAuthentication(
    @GetUser() user: User,
    @Body() activateOtpDto: ActivateOtpDto,
  ): Promise<ActivateOtpResponseDto> {
    return this.twoFactorAuthService.activaTwoFactorAuthentication(
      activateOtpDto,
      user,
    );
  }
}
