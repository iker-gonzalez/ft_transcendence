export default interface DirectMessage {
  id: string;
  senderIntraId: number;
  receiverIntraId: number;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
}
