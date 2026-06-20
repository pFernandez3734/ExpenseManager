import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Debt, DebtDocument } from './schemas/debt.schema';
import { CreateDebtDto } from './dto/create-debt.dto';

@Injectable()
export class DebtsService {
  constructor(@InjectModel(Debt.name) private debtModel: Model<DebtDocument>) {}

  async create(userId: string, dto: CreateDebtDto): Promise<DebtDocument> {
    return this.debtModel.create({ ...dto, userId: new Types.ObjectId(userId) });
  }

  async findAll(userId: string, type?: string): Promise<DebtDocument[]> {
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId), status: 'active' };
    if (type) filter.type = type;
    return this.debtModel.find(filter).sort({ createdAt: -1 });
  }

  async findOne(userId: string, id: string): Promise<DebtDocument> {
    const debt = await this.debtModel.findOne({ _id: id, userId: new Types.ObjectId(userId) });
    if (!debt) throw new NotFoundException('Adeudo no encontrado');
    return debt;
  }

  async markParticipantPaid(userId: string, debtId: string, participantName: string): Promise<DebtDocument | null> {
    await this.findOne(userId, debtId);
    return this.debtModel.findOneAndUpdate(
      { _id: debtId, 'participants.name': participantName },
      { $set: { 'participants.$.paid': true, 'participants.$.paidDate': new Date() } },
      { new: true },
    );
  }

  async settle(userId: string, id: string): Promise<DebtDocument | null> {
    await this.findOne(userId, id);
    return this.debtModel.findByIdAndUpdate(id, { status: 'settled' }, { new: true });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);
    await this.debtModel.findByIdAndDelete(id);
  }
}
