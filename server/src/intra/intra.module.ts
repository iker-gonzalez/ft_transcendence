import { Module } from '@nestjs/common';
import { IntraService } from './intra.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [IntraService],
  exports: [HttpModule, IntraService],
})
export class IntraModule {}
