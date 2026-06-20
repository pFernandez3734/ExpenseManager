import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { MsiService } from './msi.service';
import { CreateMsiDto } from './dto/create-msi.dto';

@ApiTags('MSI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('msi')
export class MsiController {
  constructor(private service: MsiService) {}

  @Post()
  @ApiOperation({ summary: 'Crear MSI' })
  create(@CurrentUser() u: CurrentUserPayload, @Body() dto: CreateMsiDto) {
    return this.service.create(u.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar MSI (filtrar por status: active|completed|cancelled)' })
  findAll(@CurrentUser() u: CurrentUserPayload, @Query('status') status?: string) {
    return this.service.findAll(u.userId, status);
  }

  @Get('month')
  @ApiOperation({ summary: 'MSI activos en un mes/año (para incluir en período de gestión)' })
  getForMonth(
    @CurrentUser() u: CurrentUserPayload,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.service.getActiveForMonth(u.userId, +year, +month);
  }

  @Get(':id')
  findOne(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.service.findOne(u.userId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de MSI' })
  updateStatus(
    @CurrentUser() u: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: { status: 'active' | 'completed' | 'cancelled' },
  ) {
    return this.service.updateStatus(u.userId, id, body.status);
  }

  @Delete(':id')
  remove(@CurrentUser() u: CurrentUserPayload, @Param('id') id: string) {
    return this.service.remove(u.userId, id);
  }
}
