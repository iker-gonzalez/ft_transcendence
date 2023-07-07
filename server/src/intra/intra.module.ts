import { Module } from '@nestjs/common';
import { IntraService } from './intra.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [IntraService],
  exports: [HttpModule, IntraService],
})
export class IntraModule {}
