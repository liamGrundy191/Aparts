import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MANAGER)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post('/properties/:propertyId/units')
  async createUnit(@Param('propertyId') propertyId: string, @Body() dto: CreateUnitDto) {
    return await this.unitsService.createUnit(propertyId, dto);
  }

  @Patch('/units/:id')
  async updateUnit(@Param('id') id: string, @Body() dto: UpdateUnitDto) {
    return await this.unitsService.updateUnit(id, dto);
  }

  @Delete('/units/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUnit(@Param('id') id: string) {
    return await this.unitsService.deleteUnit(id);
  }
}
