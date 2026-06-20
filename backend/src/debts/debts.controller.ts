import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { DebtsService } from './debts.service';
import { CreateDebtDto } from './dto/create-debt.dto';

@ApiTags('Debts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('debts')
export class DebtsController {
  constructor(private service: DebtsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar adeudo (propio, ajeno o compartido)' })
  create(@CurrentUser() u: CurrentUserPayload, @Body() dto: CreateDebtDto) {
    return this.service.create(u.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar adeudos activos (filtrar por type: owed|receivable|shared)' })
  findAll(@CurrentUser() u: CurrentUserPayload, @Query('type') type?: string) {
    return this.service.findAll(u.userId, type);
  }

  @Get(':id')
  findOne(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.service.findOne(u.userId, id);
  }

  @Patch(':id/participants/:name/paid')
  @ApiOperation({ summary: 'Marcar participante de adeudo compartido como pagado' })
  markPaid(
    @CurrentUser() u: CurrentUserPayload,
    @Param('id') id: string,
    @Param('name') name: string,
  ) {
    return this.service.markParticipantPaid(u.userId, id, name);
  }

  @Patch(':id/settle')
  @ApiOperation({ summary: 'Marcar adeudo como liquidado' })
  settle(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.service.settle(u.userId, id);
  }

  @Delete(':id')
  remove(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.service.remove(u.userId, id);
  }
}
