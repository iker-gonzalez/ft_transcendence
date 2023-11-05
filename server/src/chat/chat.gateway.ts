// chat.gateway.js
import  { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import  { Server } from 'socket.io';
import { ChatDMService } from './service/chatDM.service';
import { ChatChannelService } from './service/chatChannel.service';
import { UserService } from '../user/user.service';
import { Socket } from 'socket.io';


// Create a Map to store user sockets
const userSockets = new Map();

@WebSocketGateway({
  namespace: 'chat'
})
export class ChatGateway implements OnGatewayConnection {
  constructor(private readonly chatDMservice: ChatDMService,
    private readonly chatChannelservice: ChatChannelService,
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
    try {
      // Prueba para el get de lo DM
      const addMessageStatus =  await this.chatDMservice.addMessageToUser(payload.senderId, payload.receiverId, payload.content);
    
      // Pruebas de getters
      //const allMD2 = await this.chatDMservice.getDMBetweenUsers(idSernder, idReceiver);
      //console.log("allMD2", allMD2);

      //const usersDM = await this.chatDMservice.getAllUserDMWith(idSernder);
      //console.log("userDM", usersDM);

      //Pruebas Post
    //  await this.chatChannelservice.createChannel(idSernder, "CanalUno", "public");
    //  await this.chatChannelservice.addUserToChannel
    //  ("1cc83703-a2ed-4ec2-b021-c5db82bb3d94", "CanalUno");
    //
    //  await this.chatChannelservice.addUserToChannel
    //  ("31f0dd9b-c8fa-4df3-a07c-6bd5e40c5643", "CanalUno");


    } catch (error) {
      console.error("Error:", error);
    }

    // Emit signal to update the receiver chat frontend
    this.server.emit(`privateMessageReceived/${payload.receiverId}`,
                      JSON.stringify(payload))
}

@SubscribeMessage('joinRoom')
handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomName: string) {
  // Unir al cliente a la sala
  console.log("lkfjdfs");
  client.join(roomName);
}


@SubscribeMessage('channelMessage')
async handleChannelMessage(client, payload) {
  console.log(payload);
//
//console.log("channelRoorm");
// console.log(payload.channelRoorm);
// console.log("senderId");
// console.log(payload.senderId);
// console.log("contents"); 
// console.log(payload.content);  
// 
// try {
//   // Prueba para el get de lo chanel
//  await this.chatChannelservice.addChannelMessageToUser(payload.chatRoom, payload.senderId, payload.content);
// 
// } catch (error) {
//   console.error("Error:", error);
// }

  // Emit signal to update the sender?receiver? chat frontend
//const mess = payload.mes;
  // Emitir el mensaje a todos los clientes en la sala
  //client.to(payload.roomName).emit('newMessage', { mess, senderId: client.id });
}




}