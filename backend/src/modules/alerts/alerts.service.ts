import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  // Get all alerts that havent been resolved yet
  async findAll(tenantId: number) {
    if (!tenantId || isNaN(tenantId)) {
      return [];
    }
    
    return this.prisma.alert.findMany({
      where: { 
        tenantId: Number(tenantId),
        resolvedAt: null, // Only show unresolved alerts (we dont care about old ones)
      },
      orderBy: { triggeredAt: 'desc' },
      include: {
        incident: {
          select: {
            id: true,
            title: true,
            severity: true,
          },
        },
      },
    });
  }

  // Create a new alert. Sometimes we pass a transaction (tx) if its part of a bigger action
  async create(tenantId: number, incidentId: number, message: string, type: string, tx?: any) {
    const client = tx || this.prisma;
    return client.alert.create({
      data: {
        tenantId,
        incidentId,
        message,
        type,
      },
    });
  }

  async resolve(tenantId: number, id: number) {
    if (!tenantId || isNaN(tenantId) || !id || isNaN(id)) {
      return { count: 0 };
    }

    return this.prisma.alert.updateMany({
      where: { 
        id: Number(id), 
        tenantId: Number(tenantId) 
      },
      data: { resolvedAt: new Date() },
    });
  }
}
