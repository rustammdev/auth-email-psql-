import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dayjs from 'dayjs';
import 'dotenv/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService) {
    // config
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // SMTP server (for Gmail)
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS_KEY,
      },
    });
  }

  // Tasdiqlash kodini yaratish
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Email yuborish funksiyasi
  async sendVerificationCode(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: '"Your verify code" <rustamm.nuriddinov@gmail.com>', // Kimdan
      to: email, // Qabul qiluvchi email
      subject: 'Tasdiqlash Kodingiz', // Email sarlavhasi
      text: `Sizning tasdiqlash kodingiz: ${code}`, // Matn shaklidagi xabar
      html: `<p>Sizning tasdiqlash kodingiz: <strong>${code}</strong></p>`,
    };

    const expiresAt = dayjs().add(5, 'minute').toDate();

    try {
      await this.transporter.sendMail(mailOptions); // Email yuborish

      await this.prisma.emails.create({
        data: { code, email, expiresAt },
      });
      console.log(`Tasdiqlash kodi ${email} manziliga yuborildi.`);
    } catch (error) {
      console.error('Email yuborishda xatolik:', error);
      throw new Error('Emailni yuborib bo‘lmadi.');
    }
  }

  // Kodni tekshirish
  async verifyCode(email: string, code: string) {
    const record = await this.prisma.emails.findUnique({
      where: { email },
    });

    if (!record) {
      throw new HttpException(
        'Kod topilmadi yoki email noto‘g‘ri.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (record.expiresAt < new Date()) {
      throw new HttpException(
        'Kodning amal qilish muddati tugagan.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (record.code !== code) {
      throw new HttpException('Kod noto‘g‘ri.', HttpStatus.BAD_REQUEST);
    }
    await this.prisma.users.update({
      where: { email: email },
      data: { isVerify: true },
    });

    return { message: 'Kod muvaffaqiyatli tasdiqlandi.' };
  }
}
