import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../common/types/enums';

export type UserDocument = User & Document;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, versionKey: false },
  toObject: { virtuals: true },
})
export class User {
  @Prop({ type: String, required: true, unique: true })
  phone!: string;

  @Prop({ type: String })
  name?: string | null;

  @Prop({ type: String })
  city?: string | null;

  @Prop({ type: String })
  address?: string | null;

  @Prop({ type: String, enum: UserRole, default: UserRole.CLIENT })
  role!: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('id').get(function (this: UserDocument) {
  return this._id.toString();
});

// unique: true already creates the index
