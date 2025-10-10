import { Module } from '@nestjs/common';
import { auth } from './lib/auth';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [AuthModule.forRoot({ auth }), UserModule],
})
export class AppModule {}
