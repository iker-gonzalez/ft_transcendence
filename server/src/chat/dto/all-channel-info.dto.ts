import { ChannelType, ChatMessage, ChatRoom, ChatRoomUser, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';
import { ConversationMessageDTO } from './conversation-message.dto';
import { IntraUsernameDTO } from './intra-username.dto';


export class AllChannelInfo {
    @ApiProperty({
        description: swaggerConstants.dto.AllChannelInfoDTO.data.description,
        example: swaggerConstants.dto.AllChannelInfoDTO.data.example,
    })

    // Chat Room info
    roomName: string;
    usersInfo: IntraUsernameDTO[];
    ownerIntra: number;
    createDate: Date;

    // Channel funcionality
    adminsInfo: IntraUsernameDTO[];
    bannedInfo: IntraUsernameDTO[];
    mutedInfo: IntraUsernameDTO[];

    // Privacy
    type: ChannelType;
    password: string | null;

    // Chat Room messages
    channelMessage: ConversationMessageDTO[];

    //eturn: owner intra id,
    //admins intra ids, room name, room type, room password, room messages,
    //room users, muted users intra ids, banned users intra ids.

    constructor(achannelMessage: ConversationMessageDTO[], chatRoom: ChatRoom, ownerIntra: number) {
        this.roomName = chatRoom.name;
        this.createDate = chatRoom.createdAt;
        this.ownerIntra = ownerIntra;

        this.password = chatRoom.password;
        this.type = chatRoom.type;

        this.channelMessage = achannelMessage;

    }
    setIntrasOfMemeber(memeberIntra: IntraUsernameDTO[], member: string) {
        if (member == "users")
            this.usersInfo = memeberIntra;
        else if (member == "admin")
            this.adminsInfo = memeberIntra;
        else if (member == "banned")
            this.bannedInfo = memeberIntra;
        else if (member == "muted")
            this.mutedInfo = memeberIntra;
    }
}
