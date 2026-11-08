import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Role } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MANAGER)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProperty(@Param('id') id: string) {
    await this.propertiesService.deleteProperty(id);
  }

  @Patch('/:id')
  async editProperty(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    return await this.propertiesService.editProperty(id, dto);
  }

  @Post()
  async createProperty(@Body() dto: CreatePropertyDto) {
    return await this.propertiesService.createProperty(dto);
  }

  @Get('/:id')
  async getProperty(@Param('id') id: string) {
    return await this.propertiesService.getProperty(id);
  }

  @Get()
  async getProperties(@Query() query: PaginationQueryDto) {
    return await this.propertiesService.getProperties(query);
  }
}
