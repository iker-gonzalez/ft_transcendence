// chat.gateway.js
import  { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import  { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { UserService } from '../user/user.service';
import { Socket } from 'socket.io-client';


// Create a Map to store user sockets
const userSockets = new Map();

@WebSocketGateway({
  namespace: 'chat'
})
export class ChatGateway implements OnGatewayConnection {
  constructor(private readonly chatService: ChatService,
    private readonly userService: UserService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client :Socket, data: string ) : Promise<void> {
  }

  async handleDisconnect(client : any) : Promise<void> {

 }

  @SubscribeMessage('privateMessage')
  handlePrivateMessage(client, payload) {
    const {receiverId, content} = payload;

        
   console.log("payload");
    console.log(payload);  
    const user = client.data.user;
    console.log("user");
    console.log(user);
    console.log("receiverId");
    console.log(payload.intraId);
    console.log("content");
    console.log(payload.content);

    this.server.emit(`privateMessageReceived/${payload.intraId}`,
                      JSON.stringify(payload))
}
}