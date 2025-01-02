import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { EmailDto } from './dto/SendVerify.dto';
import { EmailService } from './email.service';
import { VerifyEmailDto } from './dto/verify.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailService: EmailService,
  ) {}

  // Ro'yxatdan o'tish endpoint
  @Post('register')
  @UsePipes(ValidationPipe)
  async register(@Body() data: CreateUserDto) {
    const { email, password } = data;
    return this.authService.register(email, password);
  }

  @Post('send-code')
  @UsePipes(ValidationPipe)
  async sendCode(@Body() data: EmailDto) {
    const { email } = data;
    return this.authService.sendVerificationEmail(email);
  }

  @Post('verify')
  @UsePipes(ValidationPipe)
  async verifyCode(@Body() data: VerifyEmailDto) {
    const { email, code } = data;
    return this.emailService.verifyCode(email, code);
  }

  // Avtorizatsiya endpoint
  @Post('login')
  @UsePipes(ValidationPipe)
  async login(@Body() data: CreateUserDto) {
    const { email, password } = data;
    return this.authService.login(email, password);
  }

  @Get()
  async get() {
    return await this.authService.get();
  }
}
