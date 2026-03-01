import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'phone must be in E.164 format',
  })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'password must be 6 digits' })
  password!: string;
}
