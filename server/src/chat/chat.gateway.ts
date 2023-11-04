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
    console.log("senderId");
    console.log(payload.senderId);
    console.log(parseInt(payload.senderId, 10));
    
    console.log("contents"); 
    console.log(payload.content);  
    
    try {
      // Prueba para el get de lo DM
      const idSernder = await this.chatService.findUserIdByIntraId(parseInt(payload.senderId, 10));
      console.log(idSernder);
      const idReceiver = await this.chatService.findUserIdByIntraId(parseInt(payload.receiverId, 10));

      const addMessageStatus =  await this.chatService.addMessageToUser(idSernder, idReceiver, payload.content);
    
      // Pruebas de getters
      const allMD2 = await this.chatService.getDMBetweenUsers(idSernder, idReceiver);
      console.log("allMD2", allMD2);

      const usersDM = await this.chatService.getAllUserDMWith(idSernder);
      console.log("userDM", usersDM);


    } catch (error) {
      console.error("Error:", error);
    }

    // Emit signal to update the sender chat frontend
    this.server.emit(`privateMessageReceived/${payload.intraId}`,
                      JSON.stringify(payload))
}
}