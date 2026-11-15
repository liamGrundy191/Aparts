import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { LeasesService } from './leases.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/strategies/jwt.strategy';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeasesController {
  constructor(private readonly leasesService: LeasesService) {}

  @Post('/units/:unitId/leases')
  @Roles(Role.MANAGER)
  async createLease(@Body() dto: CreateLeaseDto, @Param('unitId') unitId: string) {
    return await this.leasesService.createLease(unitId, dto);
  }

  @Get('/me/leases')
  @Roles(Role.TENANT)
  async getMyLeases(@CurrentUser() user: RequestUser) {
    return await this.leasesService.getMyLeases(user.id);
  }

  @Get('/me/leases/:id')
  @Roles(Role.TENANT)
  async getMyLease(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return await this.leasesService.getMyLease(id, user.id);
  }
}
