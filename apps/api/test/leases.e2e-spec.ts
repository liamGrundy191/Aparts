import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// Requires a running, seeded database: `pnpm db:up && pnpm db:seed` from the repo root
const PASSWORD = 'Password123!';
const MISSING_ID = '00000000-0000-0000-0000-000000000000';
const TENANT1 = { email: 'tenant1@aparts.dev', phone: '050-100-0001' };
const TENANT2 = { email: 'tenant2@aparts.dev', phone: '050-100-0002' };
const TERMS = { startDate: '2026-01-01', endDate: '2027-01-01', monthlyRent: 4200.5 };

type Unit = { id: string; status: string };
type Property = { id: string; units: Unit[] };
type MyLease = {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: string;
  status: string;
  unit: { id: string; unitNumber: string; bedrooms: number; property: Record<string, unknown> };
};

describe('Leases (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let managerToken: string;
  let tenant1Token: string;
  let tenant2Token: string;
  let propertyId: string;
  let unitCount = 0;

  const server = () => app.getHttpServer();
  const loginAs = async (email: string) => {
    const res = await request(server())
      .post('/api/auth/login')
      .send({ email, password: PASSWORD })
      .expect(200);
    return (res.body as { accessToken: string }).accessToken;
  };
  const auth = (token: string) => (req: request.Test) =>
    req.set('Authorization', `Bearer ${token}`);
  const asManager = (req: request.Test) => auth(managerToken)(req);

  /** A fresh vacant unit on the throwaway property, so tests don't depend on each other. */
  const newUnit = async () => {
    const res = await asManager(request(server()).post(`/api/properties/${propertyId}/units`))
      .send({ unitNumber: `L${++unitCount}`, bedrooms: 2, askingRent: 4200 })
      .expect(201);
    return (res.body as Unit).id;
  };
  const createLease = (unitId: string, body: object) =>
    asManager(request(server()).post(`/api/units/${unitId}/leases`)).send(body);
  const unitStatus = async (unitId: string) =>
    (await prisma.unit.findUniqueOrThrow({ where: { id: unitId } })).status;

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

    managerToken = await loginAs('manager@aparts.dev');
    tenant1Token = await loginAs(TENANT1.email);
    tenant2Token = await loginAs(TENANT2.email);

    const res = await asManager(request(server()).post('/api/properties'))
      .send({ name: 'E2E Leases', address: '3 Test St', city: 'Testville', notes: 'SECRET' })
      .expect(201);
    propertyId = (res.body as Property).id;
  });

  afterAll(async () => {
    // Leases block deleting their unit, so remove them first; the property delete cascades to units
    await prisma.lease.deleteMany({ where: { unit: { propertyId } } });
    await asManager(request(server()).delete(`/api/properties/${propertyId}`));
    await app.close();
  });

  describe('POST /units/:unitId/leases', () => {
    it('rejects a tenant with 403', async () => {
      const unitId = await newUnit();
      await auth(tenant1Token)(request(server()).post(`/api/units/${unitId}/leases`))
        .send({ ...TENANT1, ...TERMS })
        .expect(403);
    });

    it('creates the lease (201) and marks the unit OCCUPIED', async () => {
      const unitId = await newUnit();
      // messy input on purpose: it must be normalised like registration
      const res = await createLease(unitId, {
        email: ' Tenant1@APARTS.dev ',
        phone: '050 100 0001',
        ...TERMS,
      }).expect(201);

      expect(res.body).toMatchObject({
        unitId,
        status: 'ACTIVE',
        monthlyRent: '4200.5',
        startDate: '2026-01-01T00:00:00.000Z', // UTC midnight
        endDate: '2027-01-01T00:00:00.000Z',
      });
      expect(await unitStatus(unitId)).toBe('OCCUPIED');
    });

    it('gives the same 404 for a wrong phone, an unknown email and a mixed-up pair', async () => {
      const unitId = await newUnit();
      const bodies = [
        { email: TENANT1.email, phone: '050-999-9999' },
        { email: 'nobody@aparts.dev', phone: TENANT1.phone },
        { email: TENANT1.email, phone: TENANT2.phone }, // both exist, but belong to different tenants
        { email: 'manager@aparts.dev', phone: '+972501000000' }, // a manager can't be a tenant
      ];
      const messages = new Set<string>();
      for (const contact of bodies) {
        const res = await createLease(unitId, { ...contact, ...TERMS }).expect(404);
        messages.add((res.body as { message: string }).message);
      }
      expect(messages.size).toBe(1);
      expect(await unitStatus(unitId)).toBe('VACANT');
    });

    it('gives 404 for a unit that does not exist', () => {
      return createLease(MISSING_ID, { ...TENANT1, ...TERMS }).expect(404);
    });

    it('rejects an invalid body with 400', async () => {
      const unitId = await newUnit();
      await createLease(unitId, { ...TENANT1, ...TERMS, endDate: '2025-01-01' }).expect(400);
      await createLease(unitId, { ...TENANT1, ...TERMS, tenantId: 'x' }).expect(400);
      await createLease(unitId, { ...TENANT1, ...TERMS, status: 'ENDED' }).expect(400);
    });

    it('rejects a second active lease on the same unit with 409', async () => {
      const unitId = await newUnit();
      await createLease(unitId, { ...TENANT1, ...TERMS }).expect(201);
      await createLease(unitId, { ...TENANT2, ...TERMS }).expect(409);
      expect(await prisma.lease.count({ where: { unitId } })).toBe(1);
    });

    it('lets only one of two simultaneous requests through', async () => {
      const unitId = await newUnit();
      const results = await Promise.all([
        createLease(unitId, { ...TENANT1, ...TERMS }),
        createLease(unitId, { ...TENANT2, ...TERMS }),
      ]);
      expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
      expect(await prisma.lease.count({ where: { unitId, status: 'ACTIVE' } })).toBe(1);
    });
  });

  it('refuses to delete a property whose unit has a lease (409, not 500)', async () => {
    const res = await asManager(request(server()).post('/api/properties'))
      .send({ name: 'E2E Leases delete', address: '4 Test St', city: 'Testville' })
      .expect(201);
    const id = (res.body as Property).id;
    const unitRes = await asManager(request(server()).post(`/api/properties/${id}/units`))
      .send({ unitNumber: 'D1', bedrooms: 1, askingRent: 1000 })
      .expect(201);
    const unitId = (unitRes.body as Unit).id;
    await createLease(unitId, { ...TENANT1, ...TERMS }).expect(201);

    await asManager(request(server()).delete(`/api/properties/${id}`)).expect(409);

    await prisma.lease.deleteMany({ where: { unitId } });
    await asManager(request(server()).delete(`/api/properties/${id}`)).expect(204);
  });

  describe('GET /me/leases', () => {
    let leaseId: string;

    beforeAll(async () => {
      const unitId = await newUnit();
      leaseId = ((await createLease(unitId, { ...TENANT1, ...TERMS }).expect(201)).body as MyLease)
        .id;
    });

    it('rejects a manager with 403', () => {
      return asManager(request(server()).get('/api/me/leases')).expect(403);
    });

    it("returns the tenant's leases in the MyLease shape, without private fields", async () => {
      const res = await auth(tenant1Token)(request(server()).get('/api/me/leases')).expect(200);
      const lease = (res.body as MyLease[]).find((l) => l.id === leaseId);

      expect(lease).toBeDefined();
      expect(Object.keys(lease!).sort()).toEqual(
        ['endDate', 'id', 'monthlyRent', 'startDate', 'status', 'unit'].sort(),
      );
      expect(Object.keys(lease!.unit.property).sort()).toEqual(['address', 'city', 'id', 'name']);
      expect(JSON.stringify(res.body)).not.toContain('SECRET'); // the property's notes
    });

    it("does not list another tenant's lease", async () => {
      const res = await auth(tenant2Token)(request(server()).get('/api/me/leases')).expect(200);
      expect((res.body as MyLease[]).map((l) => l.id)).not.toContain(leaseId);
    });

    it('returns one lease by id', async () => {
      const res = await auth(tenant1Token)(
        request(server()).get(`/api/me/leases/${leaseId}`),
      ).expect(200);
      expect((res.body as MyLease).id).toBe(leaseId);
    });

    it("gives 404 (not 403) for another tenant's lease, same as for a missing one", async () => {
      await auth(tenant2Token)(request(server()).get(`/api/me/leases/${leaseId}`)).expect(404);
      await auth(tenant2Token)(request(server()).get(`/api/me/leases/${MISSING_ID}`)).expect(404);
    });
  });
});
