import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateSellerProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 160)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  category?: string;

  @IsOptional()
  @IsString()
  @Length(1, 40)
  unit?: string;

  @IsNumber()
  @Min(0)
  price_estimated!: number;
}
