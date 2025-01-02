import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async sendVerificationEmail(email: string): Promise<string> {
    // 6 xonali tasdiqlash kodini yaratish
    const verificationCode = this.emailService.generateVerificationCode();

    // Tasdiqlash kodini emailga yuborish
    await this.emailService.sendVerificationCode(email, verificationCode);

    // Kodni qaytarish yoki (masalan, vaqtinchalik saqlash uchun qayta ishlash)
    return verificationCode;
  }

  // Ro'yxatdan o'tish
  async register(email: string, password: string): Promise<any> {
    // Email mavjudligini tekshirish
    const existingUser = await this.prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException(
        'Ushbu email allaqachon ro‘yxatdan o‘tgan.',
      );
    }

    // Parolni shifrlash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yangi foydalanuvchini yaratish
    const user = await this.prisma.users.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    await this.sendVerificationEmail(email);
    return {
      message: 'Ro‘yxatdan o‘tish muvaffaqiyatli yakunlandi!',
      userId: user.id,
      isVerify: user.isVerify,
    };
  }

  // Avtorizatsiya
  async login(email: string, password: string): Promise<any> {
    // Foydalanuvchini qidirish
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email topilmadi.');
    }

    if (user.isVerify === false)
      throw new HttpException(
        { message: 'Email manzili tasdiqlanmagan.', redirect: 'verify' },
        409,
      );

    // Parolni tekshirish
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email yoki parol noto‘g‘ri.');
    }

    // JWT token yaratish
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { message: 'Muvaffaqiyatli tizimga kirdingiz!', token };
  }

  async get() {
    return await this.prisma.users.findMany();
  }
}
