import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { UpdateMeDto } from './dto/update-me.dto';
import { UserRole } from '../common/types/enums';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly usersModel: Model<UserDocument>,
  ) {}

  async findOrCreateByPhone(phone: string): Promise<UserDocument> {
    const existing = await this.usersModel.findOne({ phone }).exec();
    if (existing) return existing;
    const created = new this.usersModel({ phone });
    return created.save();
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    return this.usersModel.findOne({ phone }).exec();
  }

  async createUser(payload: {
    phone: string;
    name: string;
    city: string;
    address: string;
    role?: UserRole;
    password: string;
  }): Promise<UserDocument> {
    const existing = await this.usersModel.findOne({ phone: payload.phone }).exec();
    if (existing) {
      throw new ConflictException('Phone already registered');
    }
    const passwordHash = await bcrypt.hash(payload.password, 10);
    const created = new this.usersModel({
      phone: payload.phone,
      name: payload.name,
      city: payload.city,
      address: payload.address,
      role: payload.role ?? UserRole.CLIENT,
      password_hash: passwordHash,
    });
    return created.save();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.usersModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(id: string, dto: UpdateMeDto): Promise<UserDocument> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return user.save();
  }
}
