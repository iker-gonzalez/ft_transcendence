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
  async handlePrivateMessage(client, payload) {
    console.log("receiverId");
    console.log(payload.receiverId);
    console.log("contents"); 
    console.log(payload.content);  

    // Add DM to DB, this will update the DM chat of the sender and the receiver 
    this.chatService.addMessageToUser( payload.senderId,
                      payload.receiverId, payload.content);
    try {
      // Prueba para el get de lo DM
      const allMD = await this.chatService.getMessagesByUser(payload.senderId);
      console.log("allMD", allMD);
    } catch (error) {
      console.error("Error:", error);
    }


    // Emit signal to update the sender chat frontend
    this.server.emit(`privateMessageReceived/${payload.intraId}`,
                      JSON.stringify(payload))
}
}