import { IsString, IsNumber, Min, Max, IsOptional, IsHexColor } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCreditCardDto {
  @ApiProperty({ example: 'Santander Principal' })
  @IsString()
  alias: string;

  @ApiProperty({ example: 'Santander' })
  @IsString()
  bank: string;

  @ApiPropertyOptional({ example: '4321' })
  @IsOptional()
  @IsString()
  lastFour?: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(0)
  creditLimit: number;

  @ApiProperty({ example: 5, description: 'Día del mes en que cae el corte' })
  @IsNumber()
  @Min(1)
  @Max(31)
  cutDay: number;

  @ApiProperty({ example: 20, description: 'Días después del corte para pagar' })
  @IsNumber()
  @Min(1)
  paymentDaysAfterCut: number;

  @ApiPropertyOptional({ example: '#6366f1' })
  @IsOptional()
  @IsHexColor()
  color?: string;
}
