import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvestmentDocument = Investment & Document;

export class Contribution {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  amount: number;

  @Prop({ trim: true })
  note?: string;
}

@Schema({ timestamps: true })
export class Investment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ enum: ['afore', 'savings', 'other'], required: true })
  type: 'afore' | 'savings' | 'other';

  @Prop({ required: true, trim: true })
  name: string;

  /** % de rendimiento mensual */
  @Prop({ default: 0 })
  monthlyReturnPct: number;

  @Prop({ type: [Contribution], default: [] })
  contributions: Contribution[];

  /** Monto actual actualizado manualmente o calculado */
  @Prop({ default: 0 })
  currentAmount: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const InvestmentSchema = SchemaFactory.createForClass(Investment);
InvestmentSchema.index({ userId: 1, isActive: 1 });
