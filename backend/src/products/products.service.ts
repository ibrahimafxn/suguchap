import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Market, MarketDocument } from '../markets/market.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productsModel: Model<ProductDocument>,
    @InjectModel(Market.name)
    private readonly marketsModel: Model<MarketDocument>,
  ) {}

  async create(dto: CreateProductDto) {
    await this.ensureMarket(dto.market_id);
    const product = new this.productsModel(dto);
    return product.save();
  }

  findAll(marketId?: string) {
    if (marketId) {
      return this.productsModel.find({ market_id: marketId }).exec();
    }
    return this.productsModel.find().exec();
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findById(id);
    if (dto.market_id) {
      await this.ensureMarket(dto.market_id);
    }
    Object.assign(product, dto);
    return product.save();
  }

  async remove(id: string) {
    const product = await this.findById(id);
    await product.deleteOne();
    return { success: true };
  }

  async findById(id: string) {
    const product = await this.productsModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  private async ensureMarket(id: string) {
    const market = await this.marketsModel.findById(id).exec();
    if (!market) throw new NotFoundException('Market not found');
  }
}
