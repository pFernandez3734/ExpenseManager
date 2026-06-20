import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreditCard, CreditCardSchema } from './schemas/credit-card.schema';
import { CcPeriod, CcPeriodSchema } from './schemas/cc-period.schema';
import { CreditCardsService } from './credit-cards.service';
import { CreditCardsController } from './credit-cards.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CreditCard.name, schema: CreditCardSchema },
      { name: CcPeriod.name, schema: CcPeriodSchema },
    ]),
  ],
  controllers: [CreditCardsController],
  providers: [CreditCardsService],
  exports: [CreditCardsService],
})
export class CreditCardsModule {}
