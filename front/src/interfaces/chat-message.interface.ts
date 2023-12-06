export default interface DirectMessage {
  id: string;
  senderIntraId: number;
  receiverIntraId: number;
  receiverName: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  createdAt?: string; // TODO check why this is returned in message list, but timestamp is used when creating a new message
  roomName?: string;
}
