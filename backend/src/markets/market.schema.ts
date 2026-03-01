import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MarketDocument = Market & Document;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, versionKey: false },
  toObject: { virtuals: true },
})
export class Market {
  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: true })
  city!: string;

  @Prop({ type: Number, required: true })
  location_lat!: number;

  @Prop({ type: Number, required: true })
  location_lng!: number;

  @Prop({ type: Object })
  opening_hours?: Record<string, unknown> | null;

  @Prop({ type: Boolean, default: true })
  is_active!: boolean;
}

export const MarketSchema = SchemaFactory.createForClass(Market);

MarketSchema.virtual('id').get(function (this: MarketDocument) {
  return this._id.toString();
});
