export interface ChannelMessage {
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    senderName: string;
    receiverName: string;
    senderAvatar: string;
    receiverAvatar: string;
}
  
export interface UserInfo {
    intra: number;
    username: string;
}
  
export interface ChannelData {
    roomName: string;
    createDate: string;
    ownerIntra: number;
    password: null | string;
    type: string;
    channelMessage: ChannelMessage[];
    usersInfo: UserInfo[];
    adminsInfo: UserInfo[];
    mutedInfo: UserInfo[];
    bannedInfo: UserInfo[];
}