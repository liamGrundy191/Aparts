import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

// Requires a running, seeded database: `pnpm db:up && pnpm db:seed` from the repo root
const PASSWORD = 'Password123!';
const MISSING_ID = '00000000-0000-0000-0000-000000000000';

type Property = { id: string; name: string; city: string; units?: unknown[] };
type Page = {
  data: Property[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

describe('Properties (e2e)', () => {
  let app: INestApplication<App>;
  let managerToken: string;
  let tenantToken: string;

  const loginAs = async (email: string) => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: PASSWORD })
      .expect(200);
    return (res.body as { accessToken: string }).accessToken;
  };
  const asManager = (req: request.Test) => req.set('Authorization', `Bearer ${managerToken}`);

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

    managerToken = await loginAs('manager@aparts.dev');
    tenantToken = await loginAs('tenant1@aparts.dev');
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects requests without a token with 401', () => {
    return request(app.getHttpServer()).get('/api/properties').expect(401);
  });

  it('rejects a tenant with 403', async () => {
    const server = app.getHttpServer();
    const auth = `Bearer ${tenantToken}`;
    await request(server).get('/api/properties').set('Authorization', auth).expect(403);
    await request(server)
      .post('/api/properties')
      .set('Authorization', auth)
      .send({ name: 'X', address: 'X', city: 'X' })
      .expect(403);
  });

  it('lists properties with pagination meta', async () => {
    const server = app.getHttpServer();
    const res = await asManager(request(server).get('/api/properties')).expect(200);
    const page = res.body as Page;
    expect(page.meta).toMatchObject({ page: 1, limit: 20 });
    expect(page.data.length).toBe(Math.min(page.meta.total, 20));

    const small = (
      await asManager(request(server).get('/api/properties?page=1&limit=1')).expect(200)
    ).body as Page;
    expect(small.data).toHaveLength(1);
    expect(small.meta.totalPages).toBe(small.meta.total);
  });

  it('rejects invalid pagination with 400', async () => {
    const server = app.getHttpServer();
    await asManager(request(server).get('/api/properties?limit=500')).expect(400);
    await asManager(request(server).get('/api/properties?page=0')).expect(400);
    await asManager(request(server).get('/api/properties?page=abc')).expect(400);
  });

  it('rejects an invalid body with 400', async () => {
    const server = app.getHttpServer();
    await asManager(request(server).post('/api/properties'))
      .send({ name: 'Only name' })
      .expect(400);
    await asManager(request(server).post('/api/properties'))
      .send({ name: 'X', address: 'X', city: 'X', hacker: true })
      .expect(400);
  });

  it('returns 404 for an unknown id', async () => {
    const server = app.getHttpServer();
    await asManager(request(server).get(`/api/properties/${MISSING_ID}`)).expect(404);
    await asManager(request(server).patch(`/api/properties/${MISSING_ID}`))
      .send({ name: 'Nope' })
      .expect(404);
    await asManager(request(server).delete(`/api/properties/${MISSING_ID}`)).expect(404);
  });

  it('creates, reads, updates and deletes a property', async () => {
    const server = app.getHttpServer();

    const created = (
      await asManager(request(server).post('/api/properties'))
        .send({ name: 'E2E Tower', address: '1 Test St', city: 'Testville' })
        .expect(201)
    ).body as Property;
    expect(created).toMatchObject({ name: 'E2E Tower', city: 'Testville' });

    const fetched = (
      await asManager(request(server).get(`/api/properties/${created.id}`)).expect(200)
    ).body as Property;
    expect(fetched.units).toEqual([]);

    const updated = (
      await asManager(request(server).patch(`/api/properties/${created.id}`))
        .send({ city: 'Newtown' })
        .expect(200)
    ).body as Property;
    expect(updated).toMatchObject({ name: 'E2E Tower', city: 'Newtown' });

    await asManager(request(server).delete(`/api/properties/${created.id}`)).expect(204);
    await asManager(request(server).get(`/api/properties/${created.id}`)).expect(404);
  });
});
