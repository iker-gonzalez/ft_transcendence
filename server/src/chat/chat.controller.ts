import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseGuards,
  } from '@nestjs/common';

  import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
  } from '@nestjs/swagger';
import { ChatDMService } from './service/chatDM.service';
import { swaggerConstants } from 'config/swagger.constants';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
    constructor(private readonly chatDMService: ChatDMService) 
    {    }
    
    @Get(':userId1/:userId2') // Define la ruta para los parámetros userId1 y userId2
    @ApiParam({ name: 'userId1' }) 
    @ApiParam({ name: 'userId2' }) 
    @ApiOperation({
      summary: swaggerConstants.chat.data.summary,
    })
    async getDMBetweenUsers(
      @Param('userId1') userIntraId1: string,
      @Param('userId2') userIntraId2: string
    ) : Promise<any[]> { 
      console.log("hofdfsjdl");

      const userId1 = await this.chatDMService.findUserIdByIntraId(parseInt(userIntraId1, 10));
      const userId2 = await this.chatDMService.findUserIdByIntraId(parseInt(userIntraId2, 10));
      return this.chatDMService.getDMBetweenUsers(userId1, userId2);
 
    }  

    @Get(':userId') // Define una nueva ruta para el método getAllUserDMWith
    @ApiParam({ name: 'userId' }) 
    @ApiOperation({
      summary: swaggerConstants.chat.all.summary,
    })
    async getAllUserDMWith(
      @Param('userId') userIntraId: string
      ):Promise<any[]> {
      const userId = await this.chatDMService.findUserIdByIntraId(parseInt(userIntraId, 10));

      console.log("hofdfsjdl");
      console.log(userId);
        return this.chatDMService.getAllUserDMWith(userId);
    }

   // @Post('all/:userId') // Define una nueva ruta para el método getAllUserDMWith
   // async postCreateChatRoom(@Param('userId') userId: string): Promise<any[]> {
   //     return this.chatSMService.getAllUserDMWith(userId[1]);
   // }
}