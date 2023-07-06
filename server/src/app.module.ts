import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from 'config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    AuthModule,
    PrismaModule,
  ],
})
export class AppModule {}
