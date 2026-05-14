import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { JwtAuthGuard } from '../../middleware/auth.guard';
import { RolesGuard } from '../../middleware/roles.guard';
import { Roles } from '../../middleware/roles.decorator';
import { TenantId, CurrentUser } from '../../middleware/tenant.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('incidents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('incidents')
export class IncidentsController {
  constructor(private incidentsService: IncidentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.USER)
  @ApiOperation({ summary: 'Create a new incident' })
  create(
    @TenantId() tenantId: number,
    @CurrentUser() user: any,
    @Body() dto: CreateIncidentDto,
  ) {
    return this.incidentsService.create(tenantId, user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all incidents for the tenant' })
  findAll(@TenantId() tenantId: number, @Query() query: any) {
    return this.incidentsService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get incident details' })
  findOne(@TenantId() tenantId: number, @Param('id', ParseIntPipe) id: number) {
    return this.incidentsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update an incident' })
  update(
    @TenantId() tenantId: number,
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.incidentsService.update(tenantId, user.sub, id, dto);
  }

  @Post(':id/assign')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Assign an incident to a user' })
  assign(
    @TenantId() tenantId: number,
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('assigneeId', ParseIntPipe) assigneeId: number,
  ) {
    return this.incidentsService.assign(tenantId, user.sub, id, assigneeId);
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get incident activity timeline' })
  getActivity(@TenantId() tenantId: number, @Param('id', ParseIntPipe) id: number) {
    return this.incidentsService.getActivity(tenantId, id);
  }
}
