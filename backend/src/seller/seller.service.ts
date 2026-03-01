import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shop, ShopDocument } from './shop.schema';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Product, ProductDocument } from '../products/product.schema';
import { CreateSellerProductDto } from './dto/create-seller-product.dto';
import { UpdateSellerProductDto } from './dto/update-seller-product.dto';
import { Order, OrderDocument } from '../orders/order.schema';

@Injectable()
export class SellerService {
  constructor(
    @InjectModel(Shop.name)
    private readonly shopModel: Model<ShopDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async getMyShop(sellerId: string) {
    return this.shopModel.findOne({ seller_id: sellerId }).exec();
  }

  async createShop(sellerId: string, dto: CreateShopDto) {
    const existing = await this.shopModel.findOne({ seller_id: sellerId }).exec();
    if (existing) {
      throw new BadRequestException('Shop already exists');
    }
    const created = new this.shopModel({
      seller_id: new Types.ObjectId(sellerId),
      market_id: new Types.ObjectId(dto.market_id),
      name: dto.name,
      city: dto.city,
      address: dto.address,
      phone: dto.phone,
      is_active: true,
    });
    return created.save();
  }

  async updateShop(sellerId: string, dto: UpdateShopDto) {
    const shop = await this.shopModel.findOne({ seller_id: sellerId }).exec();
    if (!shop) throw new NotFoundException('Shop not found');
    Object.assign(shop, {
      name: dto.name ?? shop.name,
      city: dto.city ?? shop.city,
      address: dto.address ?? shop.address,
      phone: dto.phone ?? shop.phone,
    });
    if (dto.market_id) {
      shop.market_id = new Types.ObjectId(dto.market_id);
    }
    return shop.save();
  }

  async listProducts(sellerId: string) {
    return this.productModel.find({ seller_id: sellerId }).exec();
  }

  async createProduct(sellerId: string, dto: CreateSellerProductDto) {
    const shop = await this.shopModel.findOne({ seller_id: sellerId }).exec();
    if (!shop) throw new NotFoundException('Shop not found');

    const product = new this.productModel({
      market_id: shop.market_id,
      seller_id: new Types.ObjectId(sellerId),
      name: dto.name,
      category: dto.category,
      unit: dto.unit,
      price_estimated: dto.price_estimated,
      is_active: true,
    });
    return product.save();
  }

  async updateProduct(sellerId: string, productId: string, dto: UpdateSellerProductDto) {
    const product = await this.productModel.findById(productId).exec();
    if (!product) throw new NotFoundException('Product not found');
    if (!product.seller_id || product.seller_id.toString() !== sellerId) {
      throw new BadRequestException('Product not owned by seller');
    }
    Object.assign(product, dto);
    return product.save();
  }

  async removeProduct(sellerId: string, productId: string) {
    const product = await this.productModel.findById(productId).exec();
    if (!product) throw new NotFoundException('Product not found');
    if (!product.seller_id || product.seller_id.toString() !== sellerId) {
      throw new BadRequestException('Product not owned by seller');
    }
    await product.deleteOne();
    return { success: true };
  }

  async listOrders(sellerId: string) {
    const products = await this.productModel.find({ seller_id: sellerId }).select('_id').exec();
    const productIds = products.map((p) => p._id);
    if (productIds.length === 0) return [];
    return this.orderModel.find({ 'items.product_id': { $in: productIds } }).exec();
  }
}
