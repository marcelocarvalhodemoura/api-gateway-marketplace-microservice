import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

interface JwtUser {
  userId: string;
  email: string;
  role: string;
}

/**
 * Guard to verify if the user is authenticated
 */
@Injectable()
export class JwtAuthenticationGuard extends AuthGuard('jwt') {
  /**
   * Verify if the user is authenticated
   * @param context - Execution context
   * @returns boolean - True if the user is authenticated, false otherwise
   */
  constructor(private readonly reflector: Reflector) {
    super();
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest<TUser = JwtUser>(
    err: Error | null,
    user: JwtUser | false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _info: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: ExecutionContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _status?: number,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user as TUser;
  }
}
