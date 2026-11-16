import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { Inject } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {}

  async register(data: { email: string; passwordRaw: string; name: string }) {
    try {
      const passwordHash = await argon2.hash(data.passwordRaw, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
      const user = await this.usersService.create({
        email: data.email.toLowerCase().trim(),
        name: data.name.trim(),
        passwordHash,
      });
      return await this.generateTokens(user.id);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email já está em uso');
      }
      throw error;
    }
  }

  async login(data: { email: string; passwordRaw: string }) {
    const user = await this.usersService.findByEmail(data.email.toLowerCase().trim());

    // Use constant-time comparison: always verify even if user not found
    if (!user) {
      // Perform a dummy hash to prevent timing attacks
      await argon2.hash(data.passwordRaw);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await argon2.verify(user.passwordHash, data.passwordRaw);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id);
  }

  private async generateTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, type: 'access' }, { expiresIn: '15m' }),
      this.jwtService.signAsync({ sub: userId, type: 'refresh' }, { expiresIn: '7d' }),
    ]);

    const refreshTokenHash = await argon2.hash(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}
