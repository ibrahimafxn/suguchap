import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShopDocument = Shop & Document;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, versionKey: false },
  toObject: { virtuals: true },
})
export class Shop {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  seller_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Market', required: true })
  market_id!: Types.ObjectId;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: true })
  city!: string;

  @Prop({ type: String, required: true })
  address!: string;

  @Prop({ type: String })
  phone?: string | null;

  @Prop({ type: Boolean, default: true })
  is_active!: boolean;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);

ShopSchema.virtual('id').get(function (this: ShopDocument) {
  return this._id.toString();
});
