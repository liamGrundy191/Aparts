import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomUUID, timingSafeEqual } from 'crypto';
import { SafeUser, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

interface RefreshPayload {
  sub: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  user: SafeUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(dto.email);

    const passwordOk = user ? await bcrypt.compare(dto.password, user.passwordHash) : false;
    if (!user || !passwordOk) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string | undefined): Promise<AuthTokens> {
    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload || !refreshToken) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.refreshTokenHash || !this.hashMatches(refreshToken, user.refreshTokenHash)) {
      await this.usersService.setRefreshTokenHash(user.id, null);
      throw new UnauthorizedException();
    }

    return this.issueTokens(user);
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    const payload = await this.verifyRefreshToken(refreshToken);
    if (payload) {
      await this.usersService.setRefreshTokenHash(payload.sub, null);
    }
  }

  async getMe(userId: string): Promise<SafeUser> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.usersService.toSafeUser(user);
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const accessPayload: JwtPayload = { sub: user.id, role: user.role };
    const accessToken = await this.jwtService.signAsync(accessPayload);

    const refreshPayload: RefreshPayload = { sub: user.id };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
      jwtid: randomUUID(),
    });

    await this.usersService.setRefreshTokenHash(user.id, this.hashToken(refreshToken));

    const { exp } = this.jwtService.decode<{ exp: number }>(refreshToken);

    return {
      accessToken,
      refreshToken,
      refreshExpiresAt: new Date(exp * 1000),
      user: this.usersService.toSafeUser(user),
    };
  }

  private async verifyRefreshToken(token: string | undefined): Promise<RefreshPayload | null> {
    if (!token) {
      return null;
    }
    try {
      return await this.jwtService.verifyAsync<RefreshPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      return null;
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private hashMatches(token: string, storedHash: string): boolean {
    const a = Buffer.from(this.hashToken(token), 'hex');
    const b = Buffer.from(storedHash, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
