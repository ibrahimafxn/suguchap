import { PartialType } from '@nestjs/mapped-types';
import { CreateSellerProductDto } from './create-seller-product.dto';

export class UpdateSellerProductDto extends PartialType(CreateSellerProductDto) {}
