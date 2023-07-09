import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from 'config/app.config';
import { IntraService } from './intra/intra.service';
import { IntraModule } from './intra/intra.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    PrismaModule,
    AuthModule,
    IntraModule,
    UserModule,
  ],
  providers: [IntraService],
})
export class AppModule {}
