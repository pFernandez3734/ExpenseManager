import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Debt, DebtSchema } from './schemas/debt.schema';
import { DebtsService } from './debts.service';
import { DebtsController } from './debts.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Debt.name, schema: DebtSchema }])],
  controllers: [DebtsController],
  providers: [DebtsService],
})
export class DebtsModule {}
