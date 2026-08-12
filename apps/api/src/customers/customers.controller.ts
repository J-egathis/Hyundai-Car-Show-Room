import { Controller, Get, Post, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async findAll() {
    return this.customersService.findAll();
  }

  @Post()
  async create(@Body() data: any) {
    return this.customersService.create(data);
  }
}
