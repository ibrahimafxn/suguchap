import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, PaymentMethod } from '../common/types/enums';
import { Product, ProductDocument } from '../products/product.schema';
import { Market, MarketDocument } from '../markets/market.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly ordersModel: Model<OrderDocument>,
    @InjectModel(Product.name)
    private readonly productsModel: Model<ProductDocument>,
    @InjectModel(Market.name)
    private readonly marketsModel: Model<MarketDocument>,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const market = await this.marketsModel.findById(dto.market_id).exec();
    if (!market || !market.is_active) {
      throw new BadRequestException('Market is inactive or not found');
    }

    const productIds = dto.items.map((item) => item.product_id);
    const products = await this.productsModel.find({ _id: { $in: productIds } }).exec();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    for (const item of dto.items) {
      const product = productMap.get(item.product_id);
      if (!product || !product.is_active) {
        throw new BadRequestException('Product inactive or not found');
      }
    }

    const priceEstimatedTotal = dto.items.reduce(
      (acc, item) => acc + item.quantity * item.price_estimated,
      0,
    );

    const order = new this.ordersModel({
      user_id: userId,
      market_id: dto.market_id,
      status: OrderStatus.NOUVELLE,
      payment_method: dto.payment_method ?? PaymentMethod.MOBILE_MONEY,
      delivery_address: dto.delivery_address,
      delivery_city: dto.delivery_city,
      price_estimated_total: priceEstimatedTotal,
      items: dto.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_estimated: item.price_estimated,
      })),
    });

    return order.save();
  }

  async findById(id: string) {
    const order = await this.ordersModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  findForUser(userId: string) {
    return this.ordersModel.find({ user_id: userId }).sort({ created_at: -1 }).exec();
  }

  async cancel(userId: string, id: string, reason: string) {
    const order = await this.findById(id);
    if (order.user_id.toString() !== userId) {
      throw new BadRequestException('Order not owned by user');
    }
    if (![OrderStatus.NOUVELLE, OrderStatus.PRIX_VALIDE].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled');
    }
    order.status = OrderStatus.ANNULEE;
    order.cancel_reason = reason;
    return order.save();
  }

  async validatePrice(userId: string, id: string) {
    const order = await this.findById(id);
    if (order.user_id.toString() !== userId) {
      throw new BadRequestException('Order not owned by user');
    }
    if (order.status !== OrderStatus.NOUVELLE) {
      throw new BadRequestException('Order cannot be validated');
    }
    order.status = OrderStatus.PRIX_VALIDE;
    return order.save();
  }

  async markPaid(userId: string, id: string) {
    const order = await this.findById(id);
    if (order.user_id.toString() !== userId) {
      throw new BadRequestException('Order not owned by user');
    }
    if (order.status !== OrderStatus.PRIX_VALIDE) {
      throw new BadRequestException('Order is not in prix_validé status');
    }
    order.status = OrderStatus.PAYEE;
    return order.save();
  }

  async markFailed(id: string, reason: string) {
    const order = await this.findById(id);
    if (order.status !== OrderStatus.PRIX_VALIDE) {
      throw new BadRequestException('Order is not in prix_validé status');
    }
    order.status = OrderStatus.ECHEC_PAIEMENT;
    order.failed_reason = reason;
    return order.save();
  }

  async listAll() {
    return this.ordersModel.find({}).sort({ created_at: -1 }).exec();
  }

  async adjustPrice(id: string, priceRealTotal: number) {
    const order = await this.findById(id);
    if (priceRealTotal < 0) {
      throw new BadRequestException('Invalid price');
    }
    order.price_real_total = priceRealTotal;
    return order.save();
  }

  async confirmRealPrice(userId: string, id: string) {
    const order = await this.findById(id);
    if (order.user_id.toString() !== userId) {
      throw new BadRequestException('Order not owned by user');
    }
    if (order.price_real_total === null || order.price_real_total === undefined) {
      throw new BadRequestException('No real price set');
    }
    if (order.status !== OrderStatus.NOUVELLE) {
      throw new BadRequestException('Order cannot be confirmed');
    }
    order.status = OrderStatus.PRIX_VALIDE;
    return order.save();
  }
}
