import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameDataService } from './game-data.service';

@WebSocketGateway({
  namespace: 'game-data',
})
export class GameDataGateway {
  constructor(private readonly gameDataService: GameDataService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('startGame')
  onGameStart(@MessageBody() data: string): Promise<void> {
    return this.gameDataService.onGameStart(this.server, data);
  }

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
