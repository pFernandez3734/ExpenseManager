import { IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMsiDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  cardId: string;

  @ApiProperty({ example: 'Samsung S25 Ultra' })
  @IsString()
  concept: string;

  @ApiProperty({ example: 12 })
  @IsNumber()
  totalMonths: number;

  @ApiProperty({ example: 800 })
  @IsNumber()
  monthlyAmount: number;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  firstPaymentDate: string;

  @ApiProperty({ example: 'Diversión' })
  @IsString()
  category: string;
}
