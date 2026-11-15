import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { FOREIGN_KEY_VIOLATION, prismaCode, RECORD_NOT_FOUND } from '../common/utils';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteProperty(id: string) {
    try {
      await this.prisma.property.delete({
        where: { id },
      });
    } catch (error) {
      const code = prismaCode(error);
      if (code === RECORD_NOT_FOUND) throw new NotFoundException();
      // Units are deleted with the property, but a unit with leases or requests can't be
      if (code === FOREIGN_KEY_VIOLATION) {
        throw new ConflictException('Property has units with leases or maintenance requests');
      }
      throw error;
    }
  }

  async editProperty(id: string, dto: UpdatePropertyDto) {
    try {
      const res = await this.prisma.property.update({
        data: dto,
        where: { id },
        include: { units: true },
      });
      return res;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException();
      }
      throw error;
    }
  }

  async createProperty(dto: CreatePropertyDto) {
    const res = await this.prisma.property.create({
      data: dto,
    });
    return res;
  }

  async getProperty(id: string) {
    const res = await this.prisma.property.findUnique({
      where: { id },
      include: {
        units: {
          orderBy: {
            unitNumber: 'asc',
          },
        },
      },
    });
    if (!res) {
      throw new NotFoundException();
    }
    return res;
  }

  async getProperties({ page, limit }: PaginationQueryDto) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        include: {
          _count: {
            select: {
              units: true,
            },
          },
        },
      }),
      this.prisma.property.count(),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
