import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';

@Module({
  controllers : [ChatController],
  imports: [UserModule],
  providers: [ChatGateway, ChatService, UserService],
})
export class ChatModule {}
