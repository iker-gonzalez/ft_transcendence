import {
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MatchmakingService } from './matchmaking.service';
import { Socket } from 'socket.io-client';
// import { AsyncApiPub, AsyncApiSub } from 'nestjs-asyncapi';
import { NewQueuedUserDto } from './dto/new-queued-user.dto';
import { NewQueuedUserResponseDto } from './dto/new-queued-user-response.dto';
import { swaggerAsyncConstants } from '../../config/swagger-async.constants';
import { UnqueuedUserDto } from './dto/unqueued-user.dto';

@WebSocketGateway({
  namespace: 'matchmaking',
})
export class MatchmakingGateway implements OnGatewayDisconnect {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  @WebSocketServer()
  server: Server;

  // @AsyncApiPub({
  //   channel: swaggerAsyncConstants.matchmaking.endpoints.newUser.channel,
  //   description:
  //     swaggerAsyncConstants.matchmaking.endpoints.newUser.description,
  //   message: {
  //     payload: NewQueuedUserDto,
  //   },
  // })
  // @AsyncApiSub({
  //   channel: swaggerAsyncConstants.matchmaking.endpoints.newUserIntraId.channel,
  //   description:
  //     swaggerAsyncConstants.matchmaking.endpoints.newUserIntraId.description,
  //   message: {
  //     payload: NewQueuedUserResponseDto,
  //   },
  // })
  @SubscribeMessage('newUser')
  onNewUser(client: Socket, data: string): Promise<void> {
    return this.matchmakingService.addUserToQueue(this.server, client.id, data);
  }

  // @AsyncApiPub({
  //   channel: swaggerAsyncConstants.matchmaking.endpoints.unqueueUser.channel,
  //   description:
  //     swaggerAsyncConstants.matchmaking.endpoints.unqueueUser.description,
  //   message: {
  //     payload: NewQueuedUserDto,
  //   },
  // })
  // @AsyncApiSub({
  //   channel:
  //     swaggerAsyncConstants.matchmaking.endpoints.unqueuedUserIntraId.channel,
  //   description:
  //     swaggerAsyncConstants.matchmaking.endpoints.unqueuedUserIntraId
  //       .description,
  //   message: {
  //     payload: UnqueuedUserDto,
  //   },
  // })
  @SubscribeMessage('unqueueUser')
  onUnqueueUser(client: Socket, data: string): Promise<void> {
    return this.matchmakingService.removeUserFromQueue(
      this.server,
      client.id,
      data,
    );
  }

  handleDisconnect(client: any): Promise<void> {
    return this.matchmakingService.onRemoveUser(client.id);
  }
}
