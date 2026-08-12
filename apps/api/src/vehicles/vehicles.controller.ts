import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.vehiclesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.vehiclesService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.vehiclesService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}
