import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DebtDocument = Debt & Document;

export class DebtParticipant {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: false })
  paid: boolean;

  @Prop()
  paidDate?: Date;
}

export class DebtInstallment {
  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 0 })
  paid: number;
}

@Schema({ timestamps: true })
export class Debt {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  /** 'owed' = lo que debo, 'receivable' = lo que me deben, 'shared' = boletos/gastos compartidos */
  @Prop({ enum: ['owed', 'receivable', 'shared'], required: true })
  type: 'owed' | 'receivable' | 'shared';

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true })
  myAmount: number;

  @Prop({ type: [DebtParticipant], default: [] })
  participants: DebtParticipant[];

  @Prop({ type: DebtInstallment })
  installments?: DebtInstallment;

  @Prop({ trim: true })
  notes?: string;

  @Prop({ enum: ['active', 'settled'], default: 'active' })
  status: 'active' | 'settled';
}

export const DebtSchema = SchemaFactory.createForClass(Debt);
DebtSchema.index({ userId: 1, status: 1 });
