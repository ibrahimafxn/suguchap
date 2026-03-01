import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateMarketDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 160)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 120)
  city!: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  location_lat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  location_lng!: number;

  @IsOptional()
  @IsObject()
  opening_hours?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
