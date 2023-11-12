export default interface GroupMessageSender {
    username: string;
    avatar: string;
    connectStatus: boolean;
}

export default interface GroupMessage {
    content: string;
    timestamp: string;
    sender: GroupMessageSender;
}