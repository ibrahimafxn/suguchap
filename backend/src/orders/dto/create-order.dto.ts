import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsMongoId,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';
import { PaymentMethod } from '../../common/types/enums';

export class CreateOrderDto {
  @IsMongoId()
  market_id!: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 250)
  delivery_address!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 120)
  delivery_city!: string;

  @IsEnum(PaymentMethod)
  payment_method!: PaymentMethod;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
