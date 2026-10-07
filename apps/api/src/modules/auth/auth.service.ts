import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: { email: string; passwordRaw: string; name: string }) {
    const passwordHash = await argon2.hash(data.passwordRaw);
    const user = await this.usersService.create({
      email: data.email,
      name: data.name,
      passwordHash,
    });
    return this.generateTokens(user.id);
  }

  async login(data: { email: string; passwordRaw: string }) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await argon2.verify(user.passwordHash, data.passwordRaw);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id);
  }

  private async generateTokens(userId: string) {
    const accessToken = this.jwtService.sign({ sub: userId }, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign({ sub: userId }, { expiresIn: '7d' });

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
