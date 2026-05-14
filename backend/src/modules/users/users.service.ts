import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async updateRole(tenantId: number, id: number, role: Role) {
    return this.prisma.user.updateMany({
      where: { 
        id: Number(id), 
        tenantId: Number(tenantId) 
      },
      data: { role },
    });
  }
}
