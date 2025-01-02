import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailDto {
  @IsEmail({}, { message: 'Noto‘g‘ri email manzil.' })
  @IsNotEmpty({ message: 'Email bo‘sh bo‘lishi mumkin emas.' })
  email: string;
}
