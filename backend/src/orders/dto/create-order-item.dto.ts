import { IsMongoId, IsNumber, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsMongoId()
  product_id!: string;

  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @IsNumber()
  @Min(0)
  price_estimated!: number;
}
