import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.booking.findMany({
      include: { vehicle: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { vehicle: true, user: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async create(data: {
    type: 'TEST_DRIVE' | 'SERVICE';
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    dateTime: string;
    vehicleId?: string;
    serviceType?: string;
    notes?: string;
  }) {
    let tenant = await this.prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: { name: 'Apex Luxury Motors', slug: 'apex-luxury' },
      });
    }

    let staff = await this.prisma.user.findFirst({ where: { role: 'SALES' } });
    if (!staff) {
      staff = await this.prisma.user.findFirst();
      if (!staff) {
        staff = await this.prisma.user.create({
          data: {
            email: 'admin@apexmotors.com',
            password: 'hashedpassword',
            name: 'Master Concierge',
            role: 'ADMIN',
            tenantId: tenant.id,
          },
        });
      }
    }

    return this.prisma.booking.create({
      data: {
        type: data.type,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        dateTime: new Date(data.dateTime),
        vehicleId: data.vehicleId || null,
        serviceType: data.serviceType || null,
        notes: data.notes || null,
        tenantId: tenant.id,
        userId: staff.id,
        status: 'PENDING',
      },
    });
  }

  async updateStatus(id: string, status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') {
    await this.findOne(id);
    return this.prisma.booking.update({
      where: { id },
      data: { status },
    });
  }
}
