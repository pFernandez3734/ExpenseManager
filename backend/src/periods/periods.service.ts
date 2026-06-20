import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Period, PeriodDocument, FixedExpense, VariableExpense, Apartado } from './schemas/period.schema';
import { MsiService } from '../msi/msi.service';
import { CreatePeriodDto } from './dto/create-period.dto';

@Injectable()
export class PeriodsService {
  constructor(
    @InjectModel(Period.name) private periodModel: Model<PeriodDocument>,
    private msiService: MsiService,
  ) {}

  async create(userId: string, dto: CreatePeriodDto): Promise<PeriodDocument> {
    return this.periodModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
  }

  async findAll(userId: string, year?: number): Promise<PeriodDocument[]> {
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
    if (year) {
      filter.startDate = {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31),
      };
    }
    return this.periodModel.find(filter).sort({ startDate: -1 });
  }

  async findOne(userId: string, id: string): Promise<PeriodDocument> {
    const period = await this.periodModel.findOne({ _id: id, userId: new Types.ObjectId(userId) });
    if (!period) throw new NotFoundException('Período no encontrado');
    return period;
  }

  async findCurrent(userId: string): Promise<PeriodDocument | null> {
    const today = new Date();
    return this.periodModel.findOne({
      userId: new Types.ObjectId(userId),
      startDate: { $lte: today },
      endDate: { $gte: today },
    });
  }

  async addFixedExpense(userId: string, periodId: string, expense: FixedExpense): Promise<PeriodDocument | null> {
    await this.findOne(userId, periodId);
    return this.periodModel.findByIdAndUpdate(
      periodId,
      { $push: { fixedExpenses: expense } },
      { new: true },
    );
  }

  async addVariableExpense(userId: string, periodId: string, expense: VariableExpense): Promise<PeriodDocument | null> {
    await this.findOne(userId, periodId);
    return this.periodModel.findByIdAndUpdate(
      periodId,
      { $push: { variableExpenses: expense } },
      { new: true },
    );
  }

  async addApartado(userId: string, periodId: string, apartado: Apartado): Promise<PeriodDocument | null> {
    await this.findOne(userId, periodId);
    return this.periodModel.findByIdAndUpdate(
      periodId,
      { $push: { apartados: apartado } },
      { new: true },
    );
  }

  async updateSalary(userId: string, periodId: string, salary: number, extraIncome?: { description: string; amount: number; date: string }): Promise<PeriodDocument | null> {
    await this.findOne(userId, periodId);
    const update: Record<string, unknown> = { salaryIncome: salary };
    const ops: Record<string, unknown> = { $set: update };
    if (extraIncome) {
      ops.$push = { extraIncome: { ...extraIncome, date: new Date(extraIncome.date) } };
    }
    return this.periodModel.findByIdAndUpdate(periodId, ops, { new: true });
  }

  /** Resumen financiero completo del período */
  async getSummary(userId: string, periodId: string) {
    const period = await this.findOne(userId, periodId);

    const totalSalary = period.salaryIncome;
    const totalExtra = period.extraIncome.reduce((s, e) => s + e.amount, 0);
    const totalIncome = totalSalary + totalExtra;

    const totalFixed = period.fixedExpenses
      .filter((e) => e.isActive)
      .reduce((s, e) => s + e.amount, 0);

    const totalVariable = period.variableExpenses.reduce((s, e) => s + e.amount, 0);

    const totalApartados = period.apartados.reduce((s, a) => s + a.amount, 0);

    const totalTcPayments = period.tcPayments.reduce(
      (s, tc) => s + tc.firstQuincAmount + tc.secondQuincAmount, 0,
    );

    // MSI activos en el mes de este período
    const periodMonth = period.startDate.getMonth() + 1;
    const periodYear = period.startDate.getFullYear();
    const activeMsi = await this.msiService.getActiveForMonth(userId, periodYear, periodMonth);
    const totalMsi = activeMsi.reduce((s, m) => s + m.monthlyAmount, 0);

    const totalCommitments = totalFixed + totalVariable + totalApartados + totalTcPayments + totalMsi;
    const available = totalIncome - totalCommitments;

    return {
      period,
      income: { salary: totalSalary, extra: totalExtra, total: totalIncome },
      expenses: {
        fixed: totalFixed,
        variable: totalVariable,
        apartados: totalApartados,
        tcPayments: totalTcPayments,
        msi: totalMsi,
        total: totalCommitments,
      },
      available,
      availablePct: totalIncome > 0 ? Math.round((available / totalIncome) * 100) : 0,
      activeMsi,
    };
  }
}
