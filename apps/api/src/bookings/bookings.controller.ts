import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.bookingsService.create(data);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: any }) {
    return this.bookingsService.updateStatus(id, body.status);
  }
}
