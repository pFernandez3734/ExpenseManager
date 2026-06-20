import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreditCard, CreditCardDocument } from './schemas/credit-card.schema';
import { CcPeriod, CcPeriodDocument } from './schemas/cc-period.schema';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { AddMovementDto } from './dto/add-movement.dto';

@Injectable()
export class CreditCardsService {
  constructor(
    @InjectModel(CreditCard.name) private cardModel: Model<CreditCardDocument>,
    @InjectModel(CcPeriod.name) private ccPeriodModel: Model<CcPeriodDocument>,
  ) {}

  async create(userId: string, dto: CreateCreditCardDto): Promise<CreditCardDocument> {
    return this.cardModel.create({ ...dto, userId: new Types.ObjectId(userId) });
  }

  async findAll(userId: string): Promise<CreditCardDocument[]> {
    return this.cardModel.find({ userId, isActive: true }).sort({ alias: 1 });
  }

  async findOne(userId: string, cardId: string): Promise<CreditCardDocument> {
    const card = await this.cardModel.findOne({
      _id: cardId,
      userId: new Types.ObjectId(userId),
    });
    if (!card) throw new NotFoundException('Tarjeta no encontrada');
    return card;
  }

  async update(userId: string, cardId: string, dto: Partial<CreateCreditCardDto>): Promise<CreditCardDocument | null> {
    const card = await this.findOne(userId, cardId);
    return this.cardModel.findByIdAndUpdate(card._id, dto, { new: true });
  }

  async remove(userId: string, cardId: string): Promise<void> {
    const card = await this.findOne(userId, cardId);
    await this.cardModel.findByIdAndUpdate(card._id, { isActive: false });
  }

  /** Calcula fecha de corte para un mes/año dado */
  calculateCutDate(card: CreditCardDocument, year: number, month: number): Date {
    const day = Math.min(card.cutDay, new Date(year, month, 0).getDate());
    return new Date(year, month - 1, day);
  }

  /** Calcula fecha de pago a partir de la fecha de corte */
  calculatePaymentDate(card: CreditCardDocument, cutDate: Date): Date {
    const d = new Date(cutDate);
    d.setDate(d.getDate() + card.paymentDaysAfterCut);
    return d;
  }

  // ── Períodos de corte ────────────────────────────────────────────────

  async getOrCreatePeriod(userId: string, cardId: string, year: number, month: number): Promise<CcPeriodDocument> {
    const card = await this.findOne(userId, cardId);
    const cutDate = this.calculateCutDate(card, year, month);
    const paymentDate = this.calculatePaymentDate(card, cutDate);

    const existing = await this.ccPeriodModel.findOne({ cardId, cutDate });
    if (existing) return existing;

    return this.ccPeriodModel.create({
      cardId: card._id,
      userId: new Types.ObjectId(userId),
      cutDate,
      paymentDate,
    });
  }

  async getPeriods(userId: string, cardId: string): Promise<CcPeriodDocument[]> {
    await this.findOne(userId, cardId);
    return this.ccPeriodModel
      .find({ cardId, userId })
      .sort({ cutDate: -1 })
      .limit(13);
  }

  async getPeriod(userId: string, periodId: string): Promise<CcPeriodDocument> {
    const period = await this.ccPeriodModel.findOne({
      _id: periodId,
      userId: new Types.ObjectId(userId),
    });
    if (!period) throw new NotFoundException('Período de corte no encontrado');
    return period;
  }

  async addMovement(userId: string, periodId: string, dto: AddMovementDto): Promise<CcPeriodDocument | null> {
    const period = await this.getPeriod(userId, periodId);
    return this.ccPeriodModel.findByIdAndUpdate(
      period._id,
      { $push: { movements: { ...dto, date: new Date(dto.date) } } },
      { new: true },
    );
  }

  async addPayment(userId: string, periodId: string, amount: number, date: string, note?: string): Promise<CcPeriodDocument | null> {
    const period = await this.getPeriod(userId, periodId);
    return this.ccPeriodModel.findByIdAndUpdate(
      period._id,
      { $push: { payments: { amount, date: new Date(date), note } } },
      { new: true },
    );
  }

  async updateScheduledPayments(
    userId: string,
    periodId: string,
    firstQuinc: number,
    secondQuinc: number,
  ): Promise<CcPeriodDocument | null> {
    const period = await this.getPeriod(userId, periodId);
    return this.ccPeriodModel.findByIdAndUpdate(
      period._id,
      { scheduledFirstQuinc: firstQuinc, scheduledSecondQuinc: secondQuinc },
      { new: true },
    );
  }

  /** Resumen calculado del período: saldo nuevo, total gastos, pago p/no generar interés */
  async getPeriodSummary(userId: string, periodId: string) {
    const period = await this.getPeriod(userId, periodId);
    const totalExpenses = period.movements.reduce((s, m) => s + m.amount, 0);
    const totalPayments = period.payments.reduce((s, p) => s + p.amount, 0);
    const newBalance = period.previousBalance + totalExpenses - totalPayments;
    const daysLeft = Math.ceil(
      (period.paymentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

    return {
      period,
      totalExpenses,
      totalPayments,
      newBalance,
      noInterestPayment: Math.max(newBalance, 0),
      daysUntilPayment: daysLeft,
      budgetUsedPct: period.budgetAllocated
        ? Math.round((totalExpenses / period.budgetAllocated) * 100)
        : 0,
    };
  }
}
