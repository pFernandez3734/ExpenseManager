import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Period, PeriodSchema } from './schemas/period.schema';
import { PeriodsService } from './periods.service';
import { PeriodsController } from './periods.controller';
import { MsiModule } from '../msi/msi.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Period.name, schema: PeriodSchema }]),
    MsiModule,
  ],
  controllers: [PeriodsController],
  providers: [PeriodsService],
  exports: [PeriodsService],
})
export class PeriodsModule {}
