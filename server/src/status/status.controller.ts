import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { StatusService } from './status.service';
import { User } from '@prisma/client';
import { PatchStatusBodyDto } from './dto/patch-status-body.dto';
import { swaggerConstants } from '../../config/swagger.constants';
import { PatchStatusResDto } from './dto/patch-status-res.dto';

@ApiTags('User status')
@Controller('user/status')
@UseGuards(JwtGuard)
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Patch()
  @ApiOperation({
    summary: swaggerConstants.status.patch.summary,
  })
  @ApiCreatedResponse({
    description: swaggerConstants.status.patch.ok.description,
    type: PatchStatusResDto,
  })
  @ApiUnauthorizedResponse({
    description: swaggerConstants.status.patch.unauthorized.description,
  })
  @ApiBadRequestResponse({
    description: swaggerConstants.status.patch.bad.description,
  })
  patchUserStatus(
    @GetUser() user: User,
    @Body() body: PatchStatusBodyDto,
  ): Promise<PatchStatusResDto> {
    return this.statusService.patchUserStatus(user.intraId, body.status);
  }

  @Get(':intraId?')
  getUserStatus(
    @GetUser() user: User,
    @Param() params: { intraId: number },
  ): Promise<any> {
    return this.statusService.getUserStatus(+params.intraId ?? +user.intraId);
  }
}
