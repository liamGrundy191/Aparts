import { PrismaClient, Role, UnitStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Wipe in dependency order so the seed can be re-run safely
  await prisma.payment.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  await prisma.user.create({
    data: {
      email: 'manager@aparts.dev',
      passwordHash,
      firstName: 'Demo',
      lastName: 'Manager',
      role: Role.MANAGER,
    },
  });

  const tenantA = await prisma.user.create({
    data: { email: 'tenant1@aparts.dev', passwordHash, firstName: 'Dana', lastName: 'Levi' },
  });
  const tenantB = await prisma.user.create({
    data: { email: 'tenant2@aparts.dev', passwordHash, firstName: 'Omer', lastName: 'Cohen' },
  });

  const oak = await prisma.property.create({
    data: {
      name: 'Oak Residence',
      address: '12 Oak St',
      city: 'Tel Aviv',
      units: {
        create: [
          { unitNumber: '1', bedrooms: 2, rentAmount: 5200, status: UnitStatus.OCCUPIED },
          { unitNumber: '2', bedrooms: 3, rentAmount: 6400 },
        ],
      },
    },
    include: { units: true },
  });

  const pine = await prisma.property.create({
    data: {
      name: 'Pine Court',
      address: '7 Pine Ave',
      city: 'Haifa',
      units: {
        create: [
          { unitNumber: 'A', bedrooms: 1, rentAmount: 3800, status: UnitStatus.OCCUPIED },
          { unitNumber: 'B', bedrooms: 2, rentAmount: 4500 },
        ],
      },
    },
    include: { units: true },
  });

  const year = new Date().getFullYear();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  await prisma.lease.create({
    data: {
      unitId: oak.units.find((u) => u.unitNumber === '1')!.id,
      tenantId: tenantA.id,
      startDate,
      endDate,
      monthlyRent: 5200,
    },
  });
  await prisma.lease.create({
    data: {
      unitId: pine.units.find((u) => u.unitNumber === 'A')!.id,
      tenantId: tenantB.id,
      startDate,
      endDate,
      monthlyRent: 3800,
    },
  });

  console.log('Seed complete. Login: manager@aparts.dev / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
