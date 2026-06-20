import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CcPeriodDocument = CcPeriod & Document;

export class CcPayment {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ trim: true })
  note?: string;
}

export class CcMovement {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  category: string;

  @Prop({ default: false })
  isMsi: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Msi' })
  msiId?: Types.ObjectId;
}

export class CcBudgetItem {
  @Prop({ required: true })
  category: string;

  @Prop({ default: 0 })
  allocated: number;

  @Prop({ default: 0 })
  spent: number;
}

/** Representa un período de corte de una TC */
@Schema({ timestamps: true })
export class CcPeriod {
  @Prop({ type: Types.ObjectId, ref: 'CreditCard', required: true, index: true })
  cardId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  /** Fecha exacta de corte */
  @Prop({ required: true })
  cutDate: Date;

  /** Fecha límite de pago */
  @Prop({ required: true })
  paymentDate: Date;

  @Prop({ default: 0 })
  previousBalance: number;

  @Prop({ type: [CcPayment], default: [] })
  payments: CcPayment[];

  @Prop({ type: [CcMovement], default: [] })
  movements: CcMovement[];

  /** Presupuesto asignado para este período */
  @Prop({ default: 0 })
  budgetAllocated: number;

  @Prop({ type: [CcBudgetItem], default: [] })
  budgets: CcBudgetItem[];

  /** Pago programado en 1a quincena del mes de pago */
  @Prop({ default: 0 })
  scheduledFirstQuinc: number;

  /** Pago programado en 2a quincena del mes de pago */
  @Prop({ default: 0 })
  scheduledSecondQuinc: number;
}

export const CcPeriodSchema = SchemaFactory.createForClass(CcPeriod);
CcPeriodSchema.index({ cardId: 1, cutDate: -1 });
CcPeriodSchema.index({ userId: 1, cutDate: -1 });
