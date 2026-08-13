import { Controller, HttpCode, HttpStatus, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../service/auth.service';
import type {
  AuthRegisterResponse,
  RegisterDto,
} from '../service/auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'Logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: { email: string; password: string },
  ): Promise<string> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'Registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid registration data' })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<AuthRegisterResponse> {
    return this.authService.register(registerDto);
  }
}
