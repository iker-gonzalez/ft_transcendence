import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatDMService } from './service/chatDM.service';
import { ChatChannelService } from './service/chatChannel.service';
import { ChatController } from './chat.controller';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [ChatController],
  imports: [UserModule],
  providers: [ChatGateway, ChatDMService, ChatChannelService, UserService],
})
export class ChatModule { }
