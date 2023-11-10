import { ChatMessage, DirectMessage, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';

export class MessageDTO {

    id: string;
    senderId: string | null;
    content: string;
    createdAt: Date;
    senderName: string | null;
    senderAvatar: string | null;
  
    constructor(message:  any , sender: any) {
      this.id = message.id;
      this.content = message.content;
      this.createdAt = message.createdAt;
      this.senderName = sender?.username || null;
      this.senderAvatar = sender?.avatar || null;
    }
  }
  