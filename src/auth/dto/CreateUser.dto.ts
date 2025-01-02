import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Noto‘g‘ri email manzil.' })
  @IsNotEmpty({ message: 'Email bo‘sh bo‘lishi mumkin emas.' })
  email: string;

  @IsNotEmpty({ message: 'Parol bo‘sh bo‘lishi mumkin emas.' })
  @MinLength(6, {
    message: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak.',
  })
  password: string;
}
