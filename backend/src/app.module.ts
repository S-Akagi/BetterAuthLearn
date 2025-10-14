import { Module } from '@nestjs/common';
import { auth } from './lib/auth';
import { AuthModule } from '@thallesp/nestjs-better-auth';

@Module({
  imports: [AuthModule.forRoot({ auth })],
})
export class AppModule {}
