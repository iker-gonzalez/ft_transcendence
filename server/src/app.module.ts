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

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    PrismaModule,
    CacheModule.register({
      isGlobal: true,
    }),
    AuthModule,
    IntraModule,
    UserModule,
    TwoFactorAuthModule,
    GameModule,
    FriendsModule,
    MatchmakingModule,
    GameDataModule,
    ChatModule
  ],
  providers: [IntraService],
})
export class AppModule {}
