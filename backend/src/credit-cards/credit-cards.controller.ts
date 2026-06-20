import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { CreditCardsService } from './credit-cards.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { AddMovementDto } from './dto/add-movement.dto';

@ApiTags('Credit Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('credit-cards')
export class CreditCardsController {
  constructor(private service: CreditCardsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear tarjeta de crédito' })
  create(@CurrentUser() u: CurrentUserPayload, @Body() dto: CreateCreditCardDto) {
    return this.service.create(u.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tarjetas activas' })
  findAll(@CurrentUser() u: CurrentUserPayload) {
    return this.service.findAll(u.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tarjeta por ID' })
  findOne(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.service.findOne(u.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tarjeta' })
  update(
    @CurrentUser() u: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateCreditCardDto>,
  ) {
    return this.service.update(u.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar tarjeta (soft delete)' })
  remove(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.service.remove(u.userId, id);
  }

  // ── Períodos de corte ────────────────────────────────────────────────

  @Get(':id/periods')
  @ApiOperation({ summary: 'Listar períodos de corte de la tarjeta' })
  getPeriods(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.service.getPeriods(u.userId, id);
  }

  @Post(':id/periods')
  @ApiOperation({ summary: 'Crear/obtener período de corte para mes y año' })
  getOrCreatePeriod(
    @CurrentUser() u: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: { year: number; month: number },
  ) {
    return this.service.getOrCreatePeriod(u.userId, id, body.year, body.month);
  }

  @Get('periods/:periodId/summary')
  @ApiOperation({ summary: 'Resumen calculado del período de corte' })
  getPeriodSummary(@CurrentUser() u: CurrentUserPayload, @Param('periodId') periodId: string) {
    return this.service.getPeriodSummary(u.userId, periodId);
  }

  @Post('periods/:periodId/movements')
  @ApiOperation({ summary: 'Agregar movimiento a período de corte' })
  addMovement(
    @CurrentUser() u: CurrentUserPayload,
    @Param('periodId') periodId: string,
    @Body() dto: AddMovementDto,
  ) {
    return this.service.addMovement(u.userId, periodId, dto);
  }

  @Post('periods/:periodId/payments')
  @ApiOperation({ summary: 'Registrar pago a período de corte' })
  addPayment(
    @CurrentUser() u: CurrentUserPayload,
    @Param('periodId') periodId: string,
    @Body() body: { amount: number; date: string; note?: string },
  ) {
    return this.service.addPayment(u.userId, periodId, body.amount, body.date, body.note);
  }

  @Patch('periods/:periodId/scheduled-payments')
  @ApiOperation({ summary: 'Programar pagos por quincena para el período' })
  updateScheduled(
    @CurrentUser() u: CurrentUserPayload,
    @Param('periodId') periodId: string,
    @Body() body: { firstQuinc: number; secondQuinc: number },
  ) {
    return this.service.updateScheduledPayments(u.userId, periodId, body.firstQuinc, body.secondQuinc);
  }
}
