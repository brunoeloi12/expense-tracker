import { Controller, Post, Body, Res, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { FastifyReply } from 'fastify';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RegisterSchema, LoginSchema } from '@fincontrol/shared';
import type { RegisterInput, LoginInput } from '@fincontrol/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() body: RegisterInput, @Res({ passthrough: true }) res: FastifyReply) {
    const { accessToken, refreshToken } = await this.authService.register({
      email: body.email,
      name: body.name,
      passwordRaw: body.password,
    });

    this.setCookies(res, accessToken, refreshToken);
    return { success: true };
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() body: LoginInput, @Res({ passthrough: true }) res: FastifyReply) {
    const { accessToken, refreshToken } = await this.authService.login({
      email: body.email,
      passwordRaw: body.password,
    });

    this.setCookies(res, accessToken, refreshToken);
    return { success: true };
  }

  private setCookies(res: FastifyReply, accessToken: string, refreshToken: string) {
    res.setCookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    res.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
  }
}
