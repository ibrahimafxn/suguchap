import { IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import { UserRole } from '../../common/types/enums';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'phone must be in E.164 format',
  })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 120)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 120)
  city!: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 250)
  address!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'password must be 6 digits' })
  password!: string;
}
