import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail({}, { message: 'Noto‘g‘ri email manzil.' })
  @IsNotEmpty({ message: 'Email bo‘sh bo‘lishi mumkin emas.' })
  email: string;

  @IsNotEmpty()
  code: string;
}
