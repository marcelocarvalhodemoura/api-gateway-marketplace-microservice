import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth/service/auth.service';
import { Request } from 'express';

/**
 * Guard to verify if the user is authenticated
 * using the session cookie
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const sessionToken = request.headers['session_token'] as string;

    if (!sessionToken) {
      throw new UnauthorizedException('Session token is required');
    }

    try {
      const session = await this.authService.validateSessionToken(sessionToken);
      if (!session.valid || !session.user) {
        throw new UnauthorizedException('Invalid session token');
      }

      request.user = session.user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid session token');
    }
  }
}
