import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsIn,
} from 'class-validator';

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsIn(['TRADER', 'ADMIN'])
  role?: 'TRADER' | 'ADMIN';

  @IsIn(['MALE', 'FEMALE'])
  gender!: 'MALE' | 'FEMALE';
}
