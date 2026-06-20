import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { PeriodsModule } from './periods/periods.module';
import { MsiModule } from './msi/msi.module';
import { DebtsModule } from './debts/debts.module';
import { InvestmentsModule } from './investments/investments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongodb.uri'),
      }),
    }),
    AuthModule,
    UsersModule,
    CreditCardsModule,
    PeriodsModule,
    MsiModule,
    DebtsModule,
    InvestmentsModule,
  ],
})
export class AppModule {}
