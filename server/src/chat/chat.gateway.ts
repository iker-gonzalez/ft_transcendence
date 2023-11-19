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
    console.log("receiverId:");
    console.log(payload.receiverId);
    try { 
      // Prueba para el get de lo DM
      const senderId = await this.chatDMservice.findUserIdByIntraId(payload.senderId);
      const receiverId = await this.chatDMservice.findUserIdByIntraId(payload.receiverId);

      const addMessageStatus =  await this.chatDMservice.addMessageToUser(senderId, receiverId, payload.content);
     
    } catch (error) {
      console.error("Error:", error);
    }
    // Emit signal to update the receiver chat frontend
    this.server.emit(`privateMessageReceived/${payload.receiverId}`,
                      JSON.stringify(payload))
}

@SubscribeMessage('joinRoom')
async handleJoinRoom(client: Socket, paydload) {
  // Unir al cliente a la sala
  console.log("joiRoom event");
  console.log(paydload.roomName);
  console.log(paydload.intraId);

  const userId = await this.chatDMservice.findUserIdByIntraId(paydload.intraId);
  console.log(userId);
  const channelExist = await this.chatChannelservice.channelExist(paydload.roomName);
  if (!channelExist)
  {
    await this.chatChannelservice.createChannel(userId, paydload.roomName, "public");
  }
  await this.chatChannelservice.addUserToChannel(userId, paydload.roomName);

 // Obtener la lista de clientes en la sala
// const io = this.server;
// const room = io.of('/').in(roomName) as any; // Afirmación de tipo
// room.clients((error, clients) => {
//   if (!error) {
//     console.log(`Clientes en la sala ${roomName}:`, clients);
//   }
// });
 
    client.join(paydload.roomName);
    client.emit('joinedRoom', `Te has unido a la sala ${paydload.roomName}`);
}
 
@SubscribeMessage('sendMessageToRoom') 
async handleSendMessageToRoom( client: Socket, payload) {
  console.log("sendMessageToRoom event");
  console.log('roomName:', payload.roomName);
  console.log('message:', payload.message);

  try{

    // Actualizar la DB
    const userId = await this.chatDMservice.findUserIdByIntraId(payload.intraId);
    console.log(userId);
    await this.chatChannelservice.addChannelMessageToUser(payload.roomName ,userId, payload.message);
    
    // Enviar el mensaje a todos los clientes en la sala
    this.server.to(payload.roomName).emit('message', payload.message);

  }
  catch(error){
    console.error("Error:", error);
  }
 }
 
 @SubscribeMessage('leaveRoom') 
 async handleLeaveRoom(client: Socket, payload) {

  client.leave(payload.roomName);
  // Actualizar la DB
  const userId = await this.chatDMservice.findUserIdByIntraId(payload.intraId);
  await this.chatChannelservice.leaveUserFromChannel(payload.roomName, userId);

 }

 
}