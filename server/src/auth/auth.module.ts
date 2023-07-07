import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { IntraModule } from 'src/intra/intra.module';

@Module({
  imports: [ConfigModule, IntraModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
