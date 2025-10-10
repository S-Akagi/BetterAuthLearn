// src/user/user.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import * as nestjsBetterAuth from '@thallesp/nestjs-better-auth';

@Controller('users')
export class UserController {
  @Get('me')
  @UseGuards(nestjsBetterAuth.AuthGuard) // 認証必須
  me(@nestjsBetterAuth.Session() session: nestjsBetterAuth.UserSession) {
    return { user: session.user };
  }
}
