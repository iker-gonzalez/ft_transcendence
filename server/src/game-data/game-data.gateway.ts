import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameDataService } from './game-data.service';
import { AsyncApiPub, AsyncApiSub } from 'nestjs-asyncapi';
import { swaggerAsyncConstants } from '../../config/swagger-async.constants';
import { StartGameDto } from './dto/start-game.dto';
import { EmptyDto } from './dto/empty.dto';
import { ReadyPlayerDto } from './dto/ready-player.dto';

@WebSocketGateway({
  namespace: 'game-data',
})
export class GameDataGateway {
  constructor(private readonly gameDataService: GameDataService) {}

  @WebSocketServer()
  server: Server;

  @AsyncApiSub({
    channel: swaggerAsyncConstants.gameData.endpoints.startGame.channel,
    description: swaggerAsyncConstants.gameData.endpoints.startGame.description,
    message: {
      payload: StartGameDto,
    },
  })
  @AsyncApiPub({
    channel:
      swaggerAsyncConstants.gameData.endpoints.gameDataCreatedSessionId.channel,
    description:
      swaggerAsyncConstants.gameData.endpoints.gameDataCreatedSessionId
        .description,
    message: {
      payload: EmptyDto,
    },
  })
  @SubscribeMessage('startGame')
  onGameStart(@MessageBody() data: string): Promise<void> {
    return this.gameDataService.onGameStart(this.server, data);
  }

  @AsyncApiSub({
    channel: swaggerAsyncConstants.gameData.endpoints.ready.channel,
    description: swaggerAsyncConstants.gameData.endpoints.ready.description,
    message: {
      payload: ReadyPlayerDto,
    },
  })
  @AsyncApiPub({
    channel:
      swaggerAsyncConstants.gameData.endpoints.allOpponentsReadySessionId
        .channel,
    description:
      swaggerAsyncConstants.gameData.endpoints.allOpponentsReadySessionId
        .description,
    message: {
      payload: EmptyDto,
    },
  })
  @SubscribeMessage('ready')
  onUser1Ready(@MessageBody() data: string): Promise<void> {
    return this.gameDataService.onPlayerReady(this.server, data);
  }

  @SubscribeMessage('upload')
  onUploadGameDataUser(@MessageBody() data: string): Promise<void> {
    return this.gameDataService.uploadGameData(this.server, data);
  }

  @SubscribeMessage('deleteGameSet')
  onDeleteGameDataSet(@MessageBody() data: string): Promise<void> {
    return this.gameDataService.deleteGameDataSet(this.server, data);
  }
}
