import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  fName: string;

  @IsString()
  @IsNotEmpty()
  lName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;
}
