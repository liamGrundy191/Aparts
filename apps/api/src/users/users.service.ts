import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

export type SafeUser = Omit<User, 'passwordHash' | 'refreshTokenHash'>;
export type NewTenant = Pick<User, 'email' | 'firstName' | 'lastName' | 'phone'> & {
  password: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser({ email, firstName, lastName, password, phone }: NewTenant): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash: await bcrypt.hash(password, 10),
          phone,
          role: Role.TENANT,
        },
      });
    } catch (err) {
      // Two sign-ups racing past AuthService's duplicate check: the unique index catches the second one.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Email or Phone are being used');
      }
      throw err;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        phone,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async setRefreshTokenHash(id: string, refreshTokenHash: string | null): Promise<void> {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        refreshTokenHash,
      },
    });
  }

  toSafeUser(user: User): SafeUser {
    return {
      createdAt: user.createdAt,
      email: user.email,
      firstName: user.firstName,
      id: user.id,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      updatedAt: user.updatedAt,
    };
  }
}
