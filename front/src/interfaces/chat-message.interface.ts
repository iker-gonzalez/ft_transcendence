export default interface DirectMessage {
  id: string;
  senderIntraId: number;
  receiverIntraId: number;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  createdAt?: string; // TODO check why this is returned in message list, but timestamp is used when creating a new message
  roomName?: string;
}
