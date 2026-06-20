import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MsiDocument = Msi & Document;

@Schema({ timestamps: true })
export class Msi {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CreditCard', required: true })
  cardId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  concept: string;

  @Prop({ required: true })
  totalMonths: number;

  @Prop({ required: true })
  monthlyAmount: number;

  @Prop({ required: true })
  firstPaymentDate: Date;

  @Prop({ required: true })
  category: string;

  @Prop({ enum: ['active', 'completed', 'cancelled'], default: 'active' })
  status: 'active' | 'completed' | 'cancelled';

  /** Calculado: meses pagados desde firstPaymentDate hasta hoy */
  get paidMonths(): number {
    const now = new Date();
    const start = new Date(this.firstPaymentDate);
    const months =
      (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth());
    return Math.min(Math.max(months, 0), this.totalMonths);
  }

  get pendingMonths(): number {
    return this.totalMonths - this.paidMonths;
  }

  get pendingBalance(): number {
    return this.pendingMonths * this.monthlyAmount;
  }
}

export const MsiSchema = SchemaFactory.createForClass(Msi);
MsiSchema.index({ userId: 1, status: 1 });
MsiSchema.index({ cardId: 1, status: 1 });
