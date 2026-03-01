import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Market, MarketDocument } from './market.schema';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';

@Injectable()
export class MarketsService {
  constructor(
    @InjectModel(Market.name)
    private readonly marketsModel: Model<MarketDocument>,
  ) {}

  create(dto: CreateMarketDto) {
    const market = new this.marketsModel(dto);
    return market.save();
  }

  findAll() {
    return this.marketsModel.find().exec();
  }

  async findById(id: string) {
    const market = await this.marketsModel.findById(id).exec();
    if (!market) throw new NotFoundException('Market not found');
    return market;
  }

  async update(id: string, dto: UpdateMarketDto) {
    const market = await this.findById(id);
    Object.assign(market, dto);
    return market.save();
  }

  async remove(id: string) {
    const market = await this.findById(id);
    await market.deleteOne();
    return { success: true };
  }
}
