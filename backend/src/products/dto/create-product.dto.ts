import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsMongoId,
  Length,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsMongoId()
  market_id!: string;

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

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
