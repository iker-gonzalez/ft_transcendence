import {
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MatchmakingService } from './matchmaking.service';
import { Socket } from 'socket.io-client';

@WebSocketGateway({
  namespace: 'matchmaking',
})
export class MatchmakingGateway implements OnGatewayDisconnect {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('newUser')
  onNewUser(client: Socket, data: string): Promise<void> {
    return this.matchmakingService.addUserToQueue(this.server, client.id, data);
  }

  @SubscribeMessage('unqueueUser')
  onUnqueueUser(client: Socket, data: string): Promise<void> {
    return this.matchmakingService.removeUserFromQueue(
      this.server,
      client.id,
      data,
    );
  }

  @SubscribeMessage('invite')
  onInviteUser(client: Socket, data: string): Promise<void> {
    return this.matchmakingService.inviteUser(data);
  }

  handleDisconnect(client: Socket): Promise<void> {
    return this.matchmakingService.onRemoveUser(client.id);
  }
}
