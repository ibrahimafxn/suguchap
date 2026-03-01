import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Market, MarketSchema } from './market.schema';
import { MarketsService } from './markets.service';
import { MarketsController } from './markets.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Market.name, schema: MarketSchema }])],
  providers: [MarketsService],
  controllers: [MarketsController],
  exports: [MarketsService, MongooseModule],
})
export class MarketsModule {}
