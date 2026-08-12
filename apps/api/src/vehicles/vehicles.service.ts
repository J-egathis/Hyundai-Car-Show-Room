import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    make?: string;
    model?: string;
    bodyStyle?: string;
    fuelType?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    search?: string;
    featured?: boolean;
  }) {
    const where: any = {};

    if (query.make) where.make = { equals: query.make };
    if (query.model) where.model = { contains: query.model };
    if (query.bodyStyle) where.bodyStyle = { equals: query.bodyStyle };
    if (query.fuelType) where.fuelType = { equals: query.fuelType };
    if (query.featured) where.featured = true;

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = Number(query.minPrice);
      if (query.maxPrice) where.price.lte = Number(query.maxPrice);
    }

    if (query.minYear || query.maxYear) {
      where.year = {};
      if (query.minYear) where.year.gte = Number(query.minYear);
      if (query.maxYear) where.year.lte = Number(query.maxYear);
    }

    if (query.search) {
      where.OR = [
        { make: { contains: query.search } },
        { model: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    return this.prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async create(data: any) {
    let tenant = await this.prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: { name: 'Apex Luxury Motors', slug: 'apex-luxury' },
      });
    }

    return this.prisma.vehicle.create({
      data: {
        ...data,
        images: data.images || [],
        tenantId: data.tenantId || tenant.id,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
