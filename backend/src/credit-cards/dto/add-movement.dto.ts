import { IsString, IsNumber, IsDateString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddMovementDto {
  @ApiProperty({ example: '2026-06-05' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Walmart' })
  @IsString()
  description: string;

  @ApiProperty({ example: 450.5 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Servicios' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isMsi?: boolean;

  @ApiPropertyOptional({ description: 'ID del MSI si isMsi=true' })
  @IsOptional()
  @IsString()
  msiId?: string;
}
