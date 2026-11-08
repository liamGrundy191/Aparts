import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

// Requires a running, seeded database: `pnpm db:up && pnpm db:seed` from the repo root
const PASSWORD = 'Password123!';
const MISSING_ID = '00000000-0000-0000-0000-000000000000';

type Unit = { id: string; unitNumber: string; bedrooms: number; status: string };
type Property = { id: string; name: string; units: Unit[] };

describe('Units (e2e)', () => {
  let app: INestApplication<App>;
  let managerToken: string;
  let tenantToken: string;
  let propertyId: string;

  const loginAs = async (email: string) => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: PASSWORD })
      .expect(200);
    return (res.body as { accessToken: string }).accessToken;
  };
  const asManager = (req: request.Test) => req.set('Authorization', `Bearer ${managerToken}`);
  const createUnit = (unitNumber: string) =>
    asManager(request(app.getHttpServer()).post(`/api/properties/${propertyId}/units`)).send({
      unitNumber,
      bedrooms: 2,
      rentAmount: 4200.5,
    });

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

    // A throwaway property so the tests never touch seed data
    const res = await asManager(request(app.getHttpServer()).post('/api/properties'))
      .send({ name: 'E2E Units', address: '2 Test St', city: 'Testville' })
      .expect(201);
    propertyId = (res.body as Property).id;
  });

  afterAll(async () => {
    // Deleting the property cascades to its units
    await asManager(request(app.getHttpServer()).delete(`/api/properties/${propertyId}`));
    await app.close();
  });

  it('rejects a tenant with 403', () => {
    return request(app.getHttpServer())
      .post(`/api/properties/${propertyId}/units`)
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({ unitNumber: 'T', bedrooms: 1, rentAmount: 1000 })
      .expect(403);
  });

  it('rejects an invalid body with 400', async () => {
    const server = app.getHttpServer();
    const post = () => asManager(request(server).post(`/api/properties/${propertyId}/units`));
    await post().send({ unitNumber: 'X' }).expect(400);
    await post().send({ unitNumber: 'X', bedrooms: 1.5, rentAmount: 1000 }).expect(400);
    await post().send({ unitNumber: 'X', bedrooms: 1, rentAmount: -5 }).expect(400);
    await post().send({ unitNumber: 'X', bedrooms: 1, rentAmount: 10.999 }).expect(400);
    await post()
      .send({ unitNumber: 'X', bedrooms: 1, rentAmount: 1, status: 'OCCUPIED' })
      .expect(400);
  });

  it('creates a unit (201) that shows up on the property', async () => {
    const unit = (await createUnit('101').expect(201)).body as Unit;
    expect(unit).toMatchObject({ unitNumber: '101', bedrooms: 2, status: 'VACANT' });

    const property = (
      await asManager(request(app.getHttpServer()).get(`/api/properties/${propertyId}`)).expect(200)
    ).body as Property;
    expect(property.units.map((u) => u.unitNumber)).toContain('101');
  });

  it('returns 404 when the property does not exist', () => {
    return asManager(request(app.getHttpServer()).post(`/api/properties/${MISSING_ID}/units`))
      .send({ unitNumber: '1', bedrooms: 1, rentAmount: 1000 })
      .expect(404);
  });

  it('returns 409 for a duplicate unit number in the same property', async () => {
    await createUnit('dup').expect(201);
    await createUnit('dup').expect(409);
  });

  it('updates a unit, allowing its own unit number', async () => {
    const server = app.getHttpServer();
    const unit = (await createUnit('201').expect(201)).body as Unit;

    const updated = (
      await asManager(request(server).patch(`/api/units/${unit.id}`))
        .send({ unitNumber: '201', bedrooms: 3 })
        .expect(200)
    ).body as Unit;
    expect(updated).toMatchObject({ unitNumber: '201', bedrooms: 3 });
  });

  it('returns 409 when renaming to a taken unit number, 404 for an unknown unit', async () => {
    const server = app.getHttpServer();
    await createUnit('301').expect(201);
    const other = (await createUnit('302').expect(201)).body as Unit;

    await asManager(request(server).patch(`/api/units/${other.id}`))
      .send({ unitNumber: '301' })
      .expect(409);
    await asManager(request(server).patch(`/api/units/${MISSING_ID}`))
      .send({ bedrooms: 1 })
      .expect(404);
  });

  it('deletes a unit (204), then 404', async () => {
    const server = app.getHttpServer();
    const unit = (await createUnit('401').expect(201)).body as Unit;

    await asManager(request(server).delete(`/api/units/${unit.id}`)).expect(204);
    await asManager(request(server).delete(`/api/units/${unit.id}`)).expect(404);
  });

  it('refuses to delete a unit that has a lease (409)', async () => {
    const server = app.getHttpServer();
    // Seed data: Oak Residence unit 1 has an active lease
    const list = (await asManager(request(server).get('/api/properties?limit=100')).expect(200))
      .body as { data: Property[] };
    const oak = list.data.find((p) => p.name === 'Oak Residence');
    if (!oak) throw new Error('seed property "Oak Residence" missing, run pnpm db:seed');
    const detail = (await asManager(request(server).get(`/api/properties/${oak.id}`)).expect(200))
      .body as Property;
    const leased = detail.units.find((u) => u.unitNumber === '1')!;

    await asManager(request(server).delete(`/api/units/${leased.id}`)).expect(409);
  });
});
