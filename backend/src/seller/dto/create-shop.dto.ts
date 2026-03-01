import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateShopDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 160)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 120)
  city!: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 250)
  address!: string;

  @IsString()
  @IsNotEmpty()
  market_id!: string;

  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, { message: 'phone must be in E.164 format' })
  phone!: string;
}
