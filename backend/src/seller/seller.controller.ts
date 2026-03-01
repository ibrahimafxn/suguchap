import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/types/enums';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { SellerService } from './seller.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { CreateSellerProductDto } from './dto/create-seller-product.dto';
import { UpdateSellerProductDto } from './dto/update-seller-product.dto';

@Controller('api/v1/seller')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('shop')
  getShop(@CurrentUser() user: RequestUser) {
    return this.sellerService.getMyShop(user.id);
  }

  @Post('shop')
  createShop(@CurrentUser() user: RequestUser, @Body() dto: CreateShopDto) {
    return this.sellerService.createShop(user.id, dto);
  }

  @Patch('shop')
  updateShop(@CurrentUser() user: RequestUser, @Body() dto: UpdateShopDto) {
    return this.sellerService.updateShop(user.id, dto);
  }

  @Get('products')
  listProducts(@CurrentUser() user: RequestUser) {
    return this.sellerService.listProducts(user.id);
  }

  @Post('products')
  createProduct(@CurrentUser() user: RequestUser, @Body() dto: CreateSellerProductDto) {
    return this.sellerService.createProduct(user.id, dto);
  }

  @Patch('products/:id')
  updateProduct(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateSellerProductDto,
  ) {
    return this.sellerService.updateProduct(user.id, id, dto);
  }

  @Delete('products/:id')
  removeProduct(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.sellerService.removeProduct(user.id, id);
  }

  @Get('orders')
  listOrders(@CurrentUser() user: RequestUser) {
    return this.sellerService.listOrders(user.id);
  }
}
