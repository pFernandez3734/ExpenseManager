import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Msi, MsiDocument } from './schemas/msi.schema';
import { CreateMsiDto } from './dto/create-msi.dto';

@Injectable()
export class MsiService {
  constructor(@InjectModel(Msi.name) private msiModel: Model<MsiDocument>) {}

  async create(userId: string, dto: CreateMsiDto): Promise<MsiDocument> {
    return this.msiModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      cardId: new Types.ObjectId(dto.cardId),
      firstPaymentDate: new Date(dto.firstPaymentDate),
    });
  }

  async findAll(userId: string, status?: string): Promise<MsiDocument[]> {
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
    if (status) filter.status = status;
    return this.msiModel.find(filter).populate('cardId', 'alias bank color').sort({ firstPaymentDate: -1 });
  }

  async findOne(userId: string, id: string): Promise<MsiDocument> {
    const msi = await this.msiModel.findOne({ _id: id, userId: new Types.ObjectId(userId) });
    if (!msi) throw new NotFoundException('MSI no encontrado');
    return msi;
  }

  async updateStatus(userId: string, id: string, status: 'active' | 'completed' | 'cancelled'): Promise<MsiDocument | null> {
    await this.findOne(userId, id);
    return this.msiModel.findByIdAndUpdate(id, { status }, { new: true });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);
    await this.msiModel.findByIdAndDelete(id);
  }

  /** Retorna MSI activos para un mes dado (mensualidad pendiente en ese mes) */
  async getActiveForMonth(userId: string, year: number, month: number): Promise<Array<MsiDocument & { monthlyAmount: number }>> {
    const targetDate = new Date(year, month - 1, 1);
    const msisRaw = await this.msiModel.find({
      userId: new Types.ObjectId(userId),
      status: 'active',
      firstPaymentDate: { $lte: new Date(year, month - 1 + 1, 0) },
    }).populate('cardId', 'alias bank color');

    return msisRaw.filter((m) => {
      const end = new Date(m.firstPaymentDate);
      end.setMonth(end.getMonth() + m.totalMonths - 1);
      return targetDate <= end;
    }) as Array<MsiDocument & { monthlyAmount: number }>;
  }
}
