import { PrismaClient, Role, Severity, Status } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Tenants
  const acme = await prisma.tenant.upsert({
    where: { slug: 'acme' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme',
      plan: 'ENTERPRISE',
    },
  });

  const globex = await prisma.tenant.upsert({
    where: { slug: 'globex' },
    update: {},
    create: {
      name: 'Globex Inc',
      slug: 'globex',
      plan: 'FREE',
    },
  });

  // Users for Acme
  const admin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      email: 'admin@acme.com',
      passwordHash,
      role: Role.ADMIN,
      tenantId: acme.id,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@acme.com' },
    update: {},
    create: {
      email: 'manager@acme.com',
      passwordHash,
      role: Role.MANAGER,
      tenantId: acme.id,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'user1@acme.com' },
    update: {},
    create: {
      email: 'user1@acme.com',
      passwordHash,
      role: Role.USER,
      tenantId: acme.id,
    },
  });

  // Users for Globex
  const globexAdmin = await prisma.user.upsert({
    where: { email: 'admin@globex.com' },
    update: {},
    create: {
      email: 'admin@globex.com',
      passwordHash,
      role: Role.ADMIN,
      tenantId: globex.id,
    },
  });

  // Incidents for Acme
  for (let i = 1; i <= 10; i++) {
    await prisma.incident.create({
      data: {
        title: `Incident ${i} in Acme`,
        description: `Description for incident ${i}`,
        severity: i % 3 === 0 ? Severity.CRITICAL : i % 2 === 0 ? Severity.HIGH : Severity.MEDIUM,
        status: i % 4 === 0 ? Status.RESOLVED : Status.OPEN,
        tenantId: acme.id,
        createdById: admin.id,
        assigneeId: i % 2 === 0 ? manager.id : user1.id,
        logs: {
          create: {
            action: 'CREATED',
            actorId: admin.id,
            tenantId: acme.id,
          },
        },
      },
    });
  }

  // Incidents for Globex
  for (let i = 1; i <= 5; i++) {
    await prisma.incident.create({
      data: {
        title: `Globex Critical Issue ${i}`,
        description: `Internal Globex problem description ${i}`,
        severity: Severity.CRITICAL,
        status: Status.OPEN,
        tenantId: globex.id,
        createdById: globexAdmin.id,
        logs: {
          create: {
            action: 'CREATED',
            actorId: globexAdmin.id,
            tenantId: globex.id,
          },
        },
      },
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
