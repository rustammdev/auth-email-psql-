import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailService } from './email.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: 'your_jwt_secret_key', // Bu joyda maxfiy kalitni yozing
      signOptions: { expiresIn: '1h' }, // Token muddati
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
})
export class AuthModule {}
