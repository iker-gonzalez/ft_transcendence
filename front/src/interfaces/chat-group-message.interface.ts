// Purpose: Interface for chat group message objects

export default interface GroupMessage {
    id: string;
    senderName: string;
    senderAvatar: string;
    content: string;
    timestamp: string;
}