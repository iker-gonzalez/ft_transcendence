export default interface GroupMessage {
  id: string;
  roomName: string | undefined;
  senderIntraId: number | undefined;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
}
