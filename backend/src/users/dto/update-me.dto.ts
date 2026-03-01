import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(5, 250)
  address?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'phone must be in E.164 format',
  })
  phone?: string;
}
