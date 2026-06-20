import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { PeriodsService } from './periods.service';
import { CreatePeriodDto } from './dto/create-period.dto';

@ApiTags('Periods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('periods')
export class PeriodsController {
  constructor(private service: PeriodsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear período de gestión (quincena o mes)' })
  create(@CurrentUser() u: CurrentUserPayload, @Body() dto: CreatePeriodDto) {
    return this.service.create(u.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar períodos (filtrar por year)' })
  findAll(@CurrentUser() u: CurrentUserPayload, @Query('year') year?: string) {
    return this.service.findAll(u.userId, year ? +year : undefined);
  }

  @Get('current')
  @ApiOperation({ summary: 'Período activo (hoy entre startDate y endDate)' })
  findCurrent(@CurrentUser() u: CurrentUserPayload) {
    return this.service.findCurrent(u.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.service.findOne(u.userId, id);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Resumen financiero completo del período' })
  getSummary(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.service.getSummary(u.userId, id);
  }

  @Patch(':id/income')
  @ApiOperation({ summary: 'Actualizar nómina o agregar ingreso extra' })
  updateIncome(
    @CurrentUser() u: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    const { salary, extra } = body as {
      salary: number;
      extra?: { description: string; amount: number; date: string };
    };
    return this.service.updateSalary(u.userId, id, salary, extra);
  }

  @Post(':id/fixed-expenses')
  @ApiOperation({ summary: 'Agregar gasto fijo al período: { name, amount, category, paymentMethod }' })
  addFixed(
    @CurrentUser() u: CurrentUserPayload,
    @Param('id') id: string,
    @Body() expense: Record<string, unknown>,
  ) {
    return this.service.addFixedExpense(u.userId, id, expense as any);
  }

  @Post(':id/variable-expenses')
  @ApiOperation({ summary: 'Agregar gasto variable/imprevisto al período: { description, amount, category, paymentMethod, date }' })
  addVariable(
    @CurrentUser() u: CurrentUserPayload,
    @Param('id') id: string,
    @Body() expense: Record<string, unknown>,
  ) {
    return this.service.addVariableExpense(u.userId, id, expense as any);
  }

  @Post(':id/apartados')
  @ApiOperation({ summary: 'Agregar apartado: { description, amount }' })
  addApartado(
    @CurrentUser() u: CurrentUserPayload,
    @Param('id') id: string,
    @Body() apartado: Record<string, unknown>,
  ) {
    return this.service.addApartado(u.userId, id, apartado as any);
  }
}
