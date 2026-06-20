import { IsString, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ParticipantDto {
  @IsString() name: string;
  @IsNumber() amount: number;
}

class InstallmentDto {
  @IsNumber() total: number;
  @IsNumber() amount: number;
}

export class CreateDebtDto {
  @ApiProperty({ enum: ['owed', 'receivable', 'shared'] })
  @IsEnum(['owed', 'receivable', 'shared'])
  type: 'owed' | 'receivable' | 'shared';

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  totalAmount: number;

  @ApiProperty()
  @IsNumber()
  myAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants?: ParticipantDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => InstallmentDto)
  installments?: InstallmentDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
