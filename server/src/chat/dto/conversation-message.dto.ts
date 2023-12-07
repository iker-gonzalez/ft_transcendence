import { ChatMessage, DirectMessage, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
export class ConversationMessageDTO {
  @ApiProperty({
    description: swaggerConstants.dto.conversationMessageDTO.data.description,
    example: swaggerConstants.dto.conversationMessageDTO.data.example,
  })

  senderId: string | null;
  receiverId: string | null;
  content: string;
  createdAt: Date;
  senderName: string | null;
  receiverName: string | null;
  senderAvatar: string | null;
  receiverAvatar: string | null;

  roomName: string | null;

  constructor(message: DirectMessage | any, sender: any | null, receiver: User | null,
    roomName: string | null) {
    // this.senderId = message.senderId || null;
    // this.receiverId = message.receiverId || null;
    this.content = message.content;
    this.createdAt = message.createdAt;
    this.senderName = sender?.username || null;
    this.receiverName = receiver?.username || null;
    this.senderAvatar = sender?.avatar || null;
    this.receiverAvatar = receiver?.avatar || null;

    this.roomName = roomName || null;
  }
}
