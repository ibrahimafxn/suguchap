import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, versionKey: false },
  toObject: { virtuals: true },
})
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'Market', required: true })
  market_id!: Types.ObjectId;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String })
  category?: string | null;

  @Prop({ type: String })
  unit?: string | null;

  @Prop({ type: Number, required: true })
  price_estimated!: number;

  @Prop({ type: Boolean, default: true })
  is_active!: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.virtual('id').get(function (this: ProductDocument) {
  return this._id.toString();
});
