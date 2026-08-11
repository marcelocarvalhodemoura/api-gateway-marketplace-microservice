import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { serviceConfig } from 'src/config/gateway.config';
import { firstValueFrom } from 'rxjs';

interface UserSession {
  userId: string;
  sessionToken: string;
  expiresAt: Date;
}

interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

interface AuthRegisterResponse {
  accessToken?: string;
  userId?: string;
  message?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  async validateJwtToken(token: string): Promise<unknown> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateSessionToken(sessionToken: string): Promise<UserSession> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<UserSession>(
          `${serviceConfig.users.url}/session/validate/${sessionToken}`,
          {
            timeout: serviceConfig.users.timeout,
          },
        ),
      );
      return data;
    } catch {
      throw new UnauthorizedException('Invalid session token');
    }
  }

  async login(loginDto: { email: string; password: string }): Promise<string> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<string>(
          `${serviceConfig.users.url}/auth/login`,
          loginDto,
          {
            timeout: serviceConfig.users.timeout,
          },
        ),
      );
      return data;
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthRegisterResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<AuthRegisterResponse>(
          `${serviceConfig.users.url}/auth/register`,
          registerDto,
          {
            timeout: serviceConfig.users.timeout,
          },
        ),
      );
      return data;
    } catch {
      throw new BadRequestException('Invalid registration data');
    }
  }
}
