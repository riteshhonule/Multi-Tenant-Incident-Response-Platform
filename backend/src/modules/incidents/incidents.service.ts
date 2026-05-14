import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { Status } from '@prisma/client';
import { AlertsService } from '../alerts/alerts.service';

@Injectable()
export class IncidentsService {
  constructor(
    private prisma: PrismaService,
    private alertsService: AlertsService
  ) {}

  async create(tenantId: number, userId: number, dto: CreateIncidentDto) {
    return this.prisma.$transaction(async (tx) => {
      const incident = await tx.incident.create({
        data: {
          ...dto,
          tenantId,
          createdById: userId,
        },
      });

      await tx.activityLog.create({
        data: {
          action: 'CREATED',
          incidentId: incident.id,
          actorId: userId,
          tenantId,
          metadata: { title: dto.title },
        },
      });
      
      // Create a system alert for the new incident
      await this.alertsService.create(
        tenantId,
        incident.id,
        `New ${dto.severity} severity incident: ${dto.title}`,
        'NEW_INCIDENT',
        tx
      );

      return incident;
    });
  }

  async findAll(tenantId: number, filters: any) {
    const { status, severity, assigneeId, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      ...(status && { status }),
      ...(severity && { severity }),
      ...(assigneeId && { assigneeId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.incident.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          assignee: { select: { id: true, email: true } },
          creator: { select: { id: true, email: true } },
        },
      }),
      this.prisma.incident.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(tenantId: number, id: number) {
    const incident = await this.prisma.incident.findFirst({
      where: { id, tenantId },
      include: {
        assignee: { select: { id: true, email: true } },
        creator: { select: { id: true, email: true } },
      },
    });

    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  async update(tenantId: number, userId: number, id: number, dto: UpdateIncidentDto) {
    return this.prisma.$transaction(async (tx) => {
      const { version, ...data } = dto;

      const incident = await tx.incident.findFirst({
        where: { id, tenantId },
      });

      if (!incident) throw new NotFoundException('Incident not found');

      const result = await tx.incident.updateMany({
        where: {
          id,
          tenantId,
          version,
        },
        data: {
          ...data,
          version: { increment: 1 },
          ...(data.status === Status.RESOLVED && !incident.resolvedAt ? { resolvedAt: new Date() } : {}),
        },
      });

      if (result.count === 0) {
        throw new ConflictException('Incident was modified by another user. Please refresh.');
      }

      await tx.activityLog.create({
        data: {
          action: 'UPDATED',
          incidentId: id,
          actorId: userId,
          tenantId,
          metadata: data,
        },
      });

      return tx.incident.findUnique({ where: { id } });
    });
  }

  async assign(tenantId: number, userId: number, id: number, assigneeId: number) {
    return this.update(tenantId, userId, id, { 
      assigneeId, 
      version: (await this.findOne(tenantId, id)).version 
    });
  }

  async getActivity(tenantId: number, id: number) {
    return this.prisma.activityLog.findMany({
      where: { incidentId: id, tenantId },
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { id: true, email: true } } },
    });
  }
}
