import { Test } from '@nestjs/testing';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  // Only mock the Prisma methods the service actually uses
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
  };

  // A sample row, as Prisma would return it
  const user: User = {
    id: 'user-1',
    email: 'manager@aparts.dev',
    passwordHash: 'hashed-password',
    firstName: 'Demo',
    lastName: 'Manager',
    phone: null,
    role: Role.MANAGER,
    refreshTokenHash: 'hashed-refresh-token',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
    expect(user).toBeDefined();
  });

  describe('findByEmail', () => {
    it.todo('returns the user when the email exists');
    it.todo('returns null when no user has that email');
  });

  describe('findById', () => {
    it.todo('returns the user when the id exists');
    it.todo('returns null when the id does not exist');
  });

  describe('toSafeUser', () => {
    it.todo('removes passwordHash and refreshTokenHash');
    it.todo('keeps every other field');
  });
});
