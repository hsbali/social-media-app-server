import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LogInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
