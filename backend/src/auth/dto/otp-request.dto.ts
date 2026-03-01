import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class OtpRequestDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'phone must be in E.164 format',
  })
  phone!: string;
}
