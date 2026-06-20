import { IsString, IsNumber, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePeriodDto {
  @ApiProperty({ enum: ['biweekly', 'monthly'] })
  @IsEnum(['biweekly', 'monthly'])
  type: 'biweekly' | 'monthly';

  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-06-14' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ enum: [1, 2] })
  @IsOptional()
  @IsNumber()
  quinc?: 1 | 2;

  @ApiProperty({ example: 12000 })
  @IsNumber()
  salaryIncome: number;
}
