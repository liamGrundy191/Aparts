import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, UnitStatus } from '@prisma/client';
import { normalizePhone } from '@aparts/shared';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { prismaCode, UNIQUE_VIOLATION } from '../common/utils';

// Exactly the MyLease shape: never the property's notes, the tenantId or other leases.
const MY_LEASE_SELECT = {
  id: true,
  startDate: true,
  endDate: true,
  monthlyRent: true,
  status: true,
  unit: {
    select: {
      id: true,
      unitNumber: true,
      bedrooms: true,
      property: { select: { id: true, name: true, address: true, city: true } },
    },
  },
} satisfies Prisma.LeaseSelect;

@Injectable()
export class LeasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createLease(
    unitId: string,
    { email, endDate, monthlyRent, phone, startDate }: CreateLeaseDto,
  ) {
    const normalizedEmail = email.toLowerCase();
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      throw new BadRequestException('Phone number is not valid!');
    }

    const tenantByEmail = await this.usersService.findByEmail(normalizedEmail);
    const tenantByPhone = await this.usersService.findByPhone(normalizedPhone);

    if (
      !tenantByEmail ||
      !tenantByPhone ||
      tenantByPhone.id !== tenantByEmail.id ||
      tenantByEmail.role !== Role.TENANT
    ) {
      throw new NotFoundException('tenant not found!');
    }

    // Every query goes through `tx`, so the lease and the unit's new status are saved together or not at all.
    return this.prisma.$transaction(async (tx) => {
      const unit = await tx.unit.findUnique({ where: { id: unitId } });
      if (!unit) throw new NotFoundException('Unit not found');

      try {
        const lease = await tx.lease.create({
          data: {
            unitId,
            tenantId: tenantByEmail.id,
            monthlyRent,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          },
        });
        await tx.unit.update({ where: { id: unitId }, data: { status: UnitStatus.OCCUPIED } });
        return lease;
      } catch (error) {
        // The partial unique index: this unit already has an ACTIVE lease
        if (prismaCode(error) === UNIQUE_VIOLATION) {
          throw new ConflictException('Unit already has an active lease');
        }
        throw error;
      }
    });
  }

  async getMyLeases(tenantId: string) {
    return await this.prisma.lease.findMany({
      where: { tenantId },
      select: MY_LEASE_SELECT,
      orderBy: { startDate: 'desc' },
    });
  }

  async getMyLease(leaseId: string, tenantId: string) {
    // Filtered by tenantId too: someone else's lease gives the same 404 as one that doesn't exist
    const lease = await this.prisma.lease.findFirst({
      where: { id: leaseId, tenantId },
      select: MY_LEASE_SELECT,
    });
    if (!lease) throw new NotFoundException('Lease not found');
    return lease;
  }
}
