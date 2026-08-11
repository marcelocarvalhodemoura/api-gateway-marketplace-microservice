import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as PassportJwt from 'passport-jwt';
import { AuthService } from '../service/auth.service';

type JwtPayload = {
  sub?: string;
  email?: string;
  token?: string;
};

type JwtFromRequestFn = (request: unknown) => string | null;

type PassportJwtModule = {
  Strategy: new (
    options: {
      jwtFromRequest: JwtFromRequestFn;
      ignoreExpiration?: boolean;
      secretOrKey: string | Buffer;
    },
    ...args: unknown[]
  ) => object;
  ExtractJwt: {
    fromAuthHeaderAsBearerToken: () => JwtFromRequestFn;
  };
};

const { Strategy, ExtractJwt } = PassportJwt as unknown as PassportJwtModule;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    const secretOrKey = process.env.JWT_SECRET;
    if (!secretOrKey) {
      throw new Error('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload) {
      throw new UnauthorizedException('Missing token in payload');
    }

    const user = await this.authService.validateJwtToken(payload.token);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
