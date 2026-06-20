import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Investment, InvestmentDocument } from './schemas/investment.schema';

@Injectable()
export class InvestmentsService {
  constructor(@InjectModel(Investment.name) private investModel: Model<InvestmentDocument>) {}

  async create(userId: string, dto: Partial<Investment>): Promise<InvestmentDocument> {
    return this.investModel.create({ ...dto, userId: new Types.ObjectId(userId) });
  }

  async findAll(userId: string): Promise<InvestmentDocument[]> {
    return this.investModel.find({ userId: new Types.ObjectId(userId), isActive: true });
  }

  async findOne(userId: string, id: string): Promise<InvestmentDocument> {
    const inv = await this.investModel.findOne({ _id: id, userId: new Types.ObjectId(userId) });
    if (!inv) throw new NotFoundException('Inversión no encontrada');
    return inv;
  }

  async addContribution(userId: string, id: string, amount: number, date: string, note?: string): Promise<InvestmentDocument | null> {
    await this.findOne(userId, id);
    return this.investModel.findByIdAndUpdate(
      id,
      {
        $push: { contributions: { amount, date: new Date(date), note } },
        $inc: { currentAmount: amount },
      },
      { new: true },
    );
  }

  async updateCurrentAmount(userId: string, id: string, amount: number): Promise<InvestmentDocument | null> {
    await this.findOne(userId, id);
    return this.investModel.findByIdAndUpdate(id, { currentAmount: amount }, { new: true });
  }

  async getSummary(userId: string, id: string) {
    const inv = await this.findOne(userId, id);
    const totalContributed = inv.contributions.reduce((s, c) => s + c.amount, 0);
    const totalReturn = inv.currentAmount - totalContributed;
    const returnPct = totalContributed > 0 ? (totalReturn / totalContributed) * 100 : 0;
    return { investment: inv, totalContributed, totalReturn, returnPct: +returnPct.toFixed(2) };
  }
}
