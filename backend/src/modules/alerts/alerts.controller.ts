import { Controller, Get, Post, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../../middleware/auth.guard';
import { TenantId } from '../../middleware/tenant.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active alerts for the tenant' })
  findAll(@TenantId() tenantId: number) {
    return this.alertsService.findAll(tenantId);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Mark an alert as resolved' })
  resolve(@TenantId() tenantId: number, @Param('id', ParseIntPipe) id: number) {
    return this.alertsService.resolve(tenantId, id);
  }
}
