import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: number, userId: number, incidentId: number, dto: CreateCommentDto) {
    const incident = await this.prisma.incident.findFirst({
      where: { id: incidentId, tenantId },
    });
    if (!incident) throw new NotFoundException('Incident not found');

    return this.prisma.comment.create({
      data: {
        ...dto,
        tenantId,
        authorId: userId,
        incidentId,
      },
      include: {
        author: { select: { id: true, email: true } },
      },
    });
  }

  async findAll(tenantId: number, incidentId: number) {
    return this.prisma.comment.findMany({
      where: { incidentId, tenantId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, email: true } },
      },
    });
  }
}
