import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from '../config/app.config';
import { IntraService } from './intra/intra.service';
import { IntraModule } from './intra/intra.module';
import { UserModule } from './user/user.module';
import { TwoFactorAuthModule } from './two-factor-auth/two-factor-auth.module';
import { GameModule } from './game/game.module';
import { FriendsModule } from './friends/friends.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { GameDataModule } from './game-data/game-data.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ChatModule } from './chat/chat.module';
import { GameStatsModule } from './game-stats/game-stats.module';
import { GameLeaderboardModule } from './game-leaderboard/game-leaderboard.module';
import { StatusModule } from './status/status.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    PrismaModule,
    CacheModule.register({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    IntraModule,
    UserModule,
    TwoFactorAuthModule,
    GameModule,
    FriendsModule,
    MatchmakingModule,
    GameDataModule,
    ChatModule,
    GameStatsModule,
    GameLeaderboardModule,
    StatusModule,
    ServeStaticModule.forRoot({
	rootPath: join(__dirname, '..', '..', '..', 'build'),
    }),
  ],
  providers: [IntraService],
})
export class AppModule {}
