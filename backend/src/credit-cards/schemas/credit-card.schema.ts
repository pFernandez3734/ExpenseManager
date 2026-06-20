import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CreditCardDocument = CreditCard & Document;

@Schema({ timestamps: true })
export class CreditCard {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  alias: string;

  @Prop({ required: true, trim: true })
  bank: string;

  @Prop({ trim: true })
  lastFour?: string;

  @Prop({ required: true })
  creditLimit: number;

  /** Día del mes en que cae el corte (1-31) */
  @Prop({ required: true, min: 1, max: 31 })
  cutDay: number;

  /** Días después del corte para realizar el pago */
  @Prop({ required: true, default: 20 })
  paymentDaysAfterCut: number;

  @Prop({ default: '#6366f1' })
  color: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const CreditCardSchema = SchemaFactory.createForClass(CreditCard);
CreditCardSchema.index({ userId: 1, isActive: 1 });
