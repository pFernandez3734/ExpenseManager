import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { InvestmentsService } from './investments.service';
import { Investment } from './schemas/investment.schema';

@ApiTags('Investments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('investments')
export class InvestmentsController {
  constructor(private service: InvestmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear inversión o cuenta de ahorro' })
  create(@CurrentUser() u: CurrentUserPayload, @Body() dto: Partial<Investment>) {
    return this.service.create(u.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() u: CurrentUserPayload) {
    return this.service.findAll(u.userId);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Resumen: total aportado, rendimiento, % retorno' })
  getSummary(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.service.getSummary(u.userId, id);
  }

  @Post(':id/contributions')
  @ApiOperation({ summary: 'Registrar aportación' })
  addContribution(
    @CurrentUser() u: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: { amount: number; date: string; note?: string },
  ) {
    return this.service.addContribution(u.userId, id, body.amount, body.date, body.note);
  }

  @Patch(':id/current-amount')
  @ApiOperation({ summary: 'Actualizar monto actual (por estado de cuenta)' })
  updateAmount(
    @CurrentUser() u: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: { amount: number },
  ) {
    return this.service.updateCurrentAmount(u.userId, id, body.amount);
  }
}
