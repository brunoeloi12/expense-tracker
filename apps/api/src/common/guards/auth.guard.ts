import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(JwtService) private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookies(request) || this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
        algorithms: ['HS256'],
      });

      // Validate payload has required fields
      if (!payload.sub || typeof payload.sub !== 'string') {
        throw new UnauthorizedException('Invalid token payload');
      }

      request['user'] = { id: payload.sub };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromCookies(request: any): string | undefined {
    if (request.cookies && request.cookies.accessToken) {
      return request.cookies.accessToken;
    }
    return undefined;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
