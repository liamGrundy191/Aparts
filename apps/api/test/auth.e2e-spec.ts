import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

// Requires a running, seeded database: `pnpm db:up && pnpm db:seed` from the repo root
type AuthBody = { accessToken: string; user: Record<string, unknown> };
const body = (res: request.Response) => res.body as AuthBody;

const MANAGER = { email: 'manager@aparts.dev', password: 'Password123!' };

function refreshCookie(res: request.Response): string {
  const cookies = res.get('Set-Cookie') ?? [];
  const cookie = cookies.find((c) => c.startsWith('refresh_token='));
  if (!cookie) throw new Error('no refresh_token cookie set');
  return cookie.split(';')[0];
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

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
  });

  afterAll(async () => {
    await app.close();
  });

  const login = () => request(app.getHttpServer()).post('/api/auth/login').send(MANAGER);

  it('rejects a wrong password with 401', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ ...MANAGER, password: 'WrongPassword1!' })
      .expect(401);
  });

  it('rejects an invalid body with 400', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'not-an-email' })
      .expect(400);
  });

  it('logs in, returns an access token and sets an httpOnly refresh cookie', async () => {
    const res = await login().expect(200);
    expect(body(res).accessToken).toEqual(expect.any(String));
    expect(body(res).user).toMatchObject({ email: MANAGER.email, role: 'MANAGER' });
    expect(body(res).user.passwordHash).toBeUndefined();
    expect(body(res).user.refreshTokenHash).toBeUndefined();
    const raw = res.get('Set-Cookie')!.find((c) => c.startsWith('refresh_token='))!;
    expect(raw).toMatch(/HttpOnly/i);
  });

  it('GET /auth/me needs a valid access token', async () => {
    const server = app.getHttpServer();
    await request(server).get('/api/auth/me').expect(401);
    await request(server).get('/api/auth/me').set('Authorization', 'Bearer garbage').expect(401);

    const { accessToken } = body(await login().expect(200));
    const me = await request(server)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect((me.body as { email: string }).email).toBe(MANAGER.email);
  });

  it('rotates the refresh token, and a reused old token revokes the session', async () => {
    const server = app.getHttpServer();
    const first = refreshCookie(await login().expect(200));

    const refreshed = await request(server)
      .post('/api/auth/refresh')
      .set('Cookie', first)
      .expect(200);
    expect(body(refreshed).accessToken).toEqual(expect.any(String));
    const second = refreshCookie(refreshed);
    expect(second).not.toBe(first);

    // Replaying the old token fails and wipes the stored hash...
    await request(server).post('/api/auth/refresh').set('Cookie', first).expect(401);
    // ...so even the newest token no longer works.
    await request(server).post('/api/auth/refresh').set('Cookie', second).expect(401);
  });

  it('refresh without a cookie is 401', () => {
    return request(app.getHttpServer()).post('/api/auth/refresh').expect(401);
  });

  it('logout clears the cookie and the refresh token stops working', async () => {
    const server = app.getHttpServer();
    const cookie = refreshCookie(await login().expect(200));

    const out = await request(server).post('/api/auth/logout').set('Cookie', cookie).expect(204);
    expect(out.get('Set-Cookie')!.join(';')).toMatch(/refresh_token=;/);

    await request(server).post('/api/auth/refresh').set('Cookie', cookie).expect(401);
  });
});
