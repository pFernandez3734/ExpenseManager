import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PeriodDocument = Period & Document;

export class IncomeEntry {
  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;
}

export class FixedExpense {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  category: string;

  /** 'cash' o el ObjectId de la TC */
  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ default: true })
  isActive: boolean;
}

export class VariableExpense {
  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ required: true })
  date: Date;
}

export class Apartado {
  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true })
  amount: number;
}

export class BudgetItem {
  @Prop({ required: true })
  category: string;

  @Prop({ required: true, default: 0 })
  allocated: number;

  @Prop({ default: 0 })
  spent: number;
}

export class TcPayment {
  @Prop({ type: Types.ObjectId, ref: 'CreditCard', required: true })
  cardId: Types.ObjectId;

  @Prop({ default: 0 })
  firstQuincAmount: number;

  @Prop({ default: 0 })
  secondQuincAmount: number;
}

@Schema({ timestamps: true })
export class Period {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ enum: ['biweekly', 'monthly'], required: true })
  type: 'biweekly' | 'monthly';

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  /** Quincena 1 o 2 (solo para type=biweekly) */
  @Prop({ enum: [1, 2] })
  quinc?: 1 | 2;

  @Prop({ default: 0 })
  salaryIncome: number;

  @Prop({ type: [IncomeEntry], default: [] })
  extraIncome: IncomeEntry[];

  @Prop({ type: [FixedExpense], default: [] })
  fixedExpenses: FixedExpense[];

  @Prop({ type: [VariableExpense], default: [] })
  variableExpenses: VariableExpense[];

  @Prop({ type: [Apartado], default: [] })
  apartados: Apartado[];

  @Prop({ type: [BudgetItem], default: [] })
  budgets: BudgetItem[];

  @Prop({ type: [TcPayment], default: [] })
  tcPayments: TcPayment[];
}

export const PeriodSchema = SchemaFactory.createForClass(Period);
PeriodSchema.index({ userId: 1, startDate: -1 });
PeriodSchema.index({ userId: 1, startDate: 1, endDate: 1 });
