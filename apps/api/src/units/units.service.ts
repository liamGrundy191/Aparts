import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

// Prisma error codes: https://www.prisma.io/docs/orm/reference/error-reference
const UNIQUE_VIOLATION = 'P2002'; // unitNumber already used in this property
const FOREIGN_KEY_VIOLATION = 'P2003'; // property missing, or unit still has leases/requests
const RECORD_NOT_FOUND = 'P2025';

function prismaCode(error: unknown): string | undefined {
  return error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
}

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async createUnit(propertyId: string, dto: CreateUnitDto) {
    try {
      return await this.prisma.unit.create({ data: { propertyId, ...dto } });
    } catch (error) {
      const code = prismaCode(error);
      if (code === FOREIGN_KEY_VIOLATION) throw new NotFoundException('Property not found');
      if (code === UNIQUE_VIOLATION) throw new ConflictException('Unit number already exists');
      throw error;
    }
  }

  async updateUnit(id: string, dto: UpdateUnitDto) {
    try {
      return await this.prisma.unit.update({ where: { id }, data: dto });
    } catch (error) {
      const code = prismaCode(error);
      if (code === RECORD_NOT_FOUND) throw new NotFoundException('Unit not found');
      if (code === UNIQUE_VIOLATION) throw new ConflictException('Unit number already exists');
      throw error;
    }
  }

  async deleteUnit(id: string) {
    try {
      await this.prisma.unit.delete({ where: { id } });
    } catch (error) {
      const code = prismaCode(error);
      if (code === RECORD_NOT_FOUND) throw new NotFoundException('Unit not found');
      if (code === FOREIGN_KEY_VIOLATION) {
        throw new ConflictException('Unit has leases or maintenance requests');
      }
      throw error;
    }
  }
}
