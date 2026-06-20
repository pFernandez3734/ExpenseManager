import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export class UserSettings {
  @Prop({ enum: ['biweekly', 'monthly'], default: 'biweekly' })
  cycle: 'biweekly' | 'monthly';

  @Prop({ default: 'MXN' })
  currency: string;

  @Prop({ type: [String], default: ['Diversión', 'Restaurantes', 'Ropa', 'Salud', 'Servicios', 'Televia', 'Transporte'] })
  categories: string[];
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: UserSettings, default: () => ({}) })
  settings: UserSettings;

  @Prop()
  refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 });
