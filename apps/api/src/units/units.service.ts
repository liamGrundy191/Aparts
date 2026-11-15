import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import {
  prismaCode,
  FOREIGN_KEY_VIOLATION,
  UNIQUE_VIOLATION,
  RECORD_NOT_FOUND,
} from '../common/utils';

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
