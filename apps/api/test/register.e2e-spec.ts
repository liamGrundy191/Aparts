import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// Requires a running, seeded database: `pnpm db:up && pnpm db:seed` from the repo root
type AuthBody = { accessToken: string; user: Record<string, unknown> };
const body = (res: request.Response) => res.body as AuthBody;

// Every user this file creates has this email prefix, so afterAll can delete them all.
const PREFIX = 'e2e-register-';
let counter = 0;

/** A fresh, valid registration body with a unique email and Israeli mobile number. */
function newTenant() {
  counter += 1;
  const digits = String(Date.now() % 1_000_000).padStart(6, '0') + String(counter % 10);
  return {
    firstName: 'Test',
    lastName: 'Tenant',
    email: `${PREFIX}${Date.now()}-${counter}@aparts.dev`,
    phone: `052${digits}`, // 052 + 7 digits, e.g. 0521234567
    password: 'Password123!',
  };
}

describe('Register (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    // Same setup as main.ts
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { startsWith: PREFIX } } });
    await app.close();
  });

  const register = (data: object) =>
    request(app.getHttpServer()).post('/api/auth/register').send(data);

  it('creates a tenant, returns tokens and never returns a hash', async () => {
    const tenant = newTenant();
    const res = await register(tenant).expect(201);

    expect(body(res).accessToken).toEqual(expect.any(String));
    expect(body(res).user).toMatchObject({ email: tenant.email, role: 'TENANT' });
    expect(body(res).user.passwordHash).toBeUndefined();
    expect(body(res).user.refreshTokenHash).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toMatch(/\$2[aby]\$/); // no bcrypt hash anywhere
    expect(res.get('Set-Cookie')!.some((c) => c.startsWith('refresh_token='))).toBe(true);
  });

  it('stores the phone in E.164 and the email in lowercase', async () => {
    const tenant = newTenant();
    const res = await register({ ...tenant, email: tenant.email.toUpperCase() }).expect(201);

    expect(body(res).user.email).toBe(tenant.email);
    expect(body(res).user.phone).toBe(`+972${tenant.phone.slice(1)}`);
  });

  it('lets the new tenant log in', async () => {
    const tenant = newTenant();
    await register(tenant).expect(201);
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: tenant.email, password: tenant.password })
      .expect(200);
  });

  // Fails until login lowercases the email the same way register does.
  it('lets a tenant log in with the same mixed-case email they registered with', async () => {
    const tenant = newTenant();
    const email = tenant.email.replace(PREFIX, 'E2E-Register-');
    await register({ ...tenant, email }).expect(201);
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: tenant.password })
      .expect(200);
  });

  it('rejects a body that tries to set the role, and creates nobody', async () => {
    const tenant = newTenant();
    await register({ ...tenant, role: 'MANAGER' }).expect(400);
    expect(await prisma.user.findUnique({ where: { email: tenant.email } })).toBeNull();
  });

  it('rejects a duplicate email with 409, whatever its casing', async () => {
    const tenant = newTenant();
    await register(tenant).expect(201);
    const other = newTenant();
    await register({ ...other, email: tenant.email.toUpperCase() }).expect(409);
  });

  it('rejects a duplicate phone with 409, whatever its format', async () => {
    const tenant = newTenant();
    await register(tenant).expect(201);
    const p = tenant.phone; // 0521234567
    const reformatted = `+972 ${p.slice(1, 3)}-${p.slice(3, 6)}-${p.slice(6)}`; // +972 52-123-4567
    await register({ ...newTenant(), phone: reformatted }).expect(409);
  });

  it('accepts any phone format the form accepts, e.g. (052) 123-4567', async () => {
    const tenant = newTenant();
    const p = tenant.phone;
    const res = await register({
      ...tenant,
      phone: `(${p.slice(0, 3)}) ${p.slice(3, 6)}-${p.slice(6)}`,
    }).expect(201);
    expect(body(res).user.phone).toBe(`+972${p.slice(1)}`);
  });

  it('answers 409, not 500, when the same sign-up is sent twice at once', async () => {
    const tenant = newTenant();
    const statuses = await Promise.all(
      Array.from({ length: 4 }, () => register(tenant).then((r) => r.status)),
    );
    expect(statuses.filter((s) => s === 201)).toHaveLength(1);
    expect(statuses.filter((s) => s === 409)).toHaveLength(3);
  });

  it.each([
    ['a missing field', { lastName: undefined }],
    ['an invalid email', { email: 'not-an-email' }],
    ['an invalid phone', { phone: '12345' }],
    ['a short password', { password: 'short' }],
    ['a blank first name', { firstName: '   ' }],
  ])('rejects %s with 400', async (_, override) => {
    await register({ ...newTenant(), ...override }).expect(400);
  });
});
