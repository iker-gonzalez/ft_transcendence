import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { IntraModule } from 'src/intra/intra.module';

@Module({
  imports: [IntraModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
