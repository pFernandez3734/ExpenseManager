import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Msi, MsiSchema } from './schemas/msi.schema';
import { MsiService } from './msi.service';
import { MsiController } from './msi.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Msi.name, schema: MsiSchema }])],
  controllers: [MsiController],
  providers: [MsiService],
  exports: [MsiService],
})
export class MsiModule {}
