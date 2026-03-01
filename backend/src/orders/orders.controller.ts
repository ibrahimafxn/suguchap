import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/types/enums';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { MarkFailedDto } from './dto/mark-failed.dto';

@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Get()
  findMe(@CurrentUser() user: RequestUser, @Query('me') me?: string) {
    if (me === '1') {
      return this.ordersService.findForUser(user.id);
    }
    return [];
  }

  @Post(':id/cancel')
  cancel(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.ordersService.cancel(user.id, id, dto.reason);
  }

  @Post(':id/mark-failed')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  markFailed(@Param('id') id: string, @Body() dto: MarkFailedDto) {
    return this.ordersService.markFailed(id, dto.reason);
  }
}
