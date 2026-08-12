import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.customer.findMany({
      include: { bookings: true, vehicles: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { name: string; email: string; phone?: string; address?: string }) {
    let tenant = await this.prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: { name: 'Apex Luxury Motors', slug: 'apex-luxury' },
      });
    }

    return this.prisma.customer.create({
      data: {
        ...data,
        tenantId: tenant.id,
      },
    });
  }
}
