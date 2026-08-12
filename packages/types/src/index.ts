export type Role = 'ADMIN' | 'SALES' | 'SERVICE' | 'CUSTOMER';

export type VehicleStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export type BookingType = 'TEST_DRIVE' | 'SERVICE';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  theme: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string;
  createdAt: Date | string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  tenantId: string;
  score?: number;
  createdAt: Date | string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  bodyStyle?: string;
  color?: string;
  engine?: string;
  horsepower?: number;
  description?: string;
  images: string[];
  status: VehicleStatus;
  featured: boolean;
  tenantId: string;
  customerId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Booking {
  id: string;
  type: BookingType;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  dateTime: Date | string;
  status: BookingStatus;
  vehicleId?: string;
  vehicle?: Vehicle;
  userId: string;
  tenantId: string;
  serviceType?: string;
  notes?: string;
  homeTestDrive?: boolean;
  progressPercent?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface VehicleFilterState {
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  bodyStyle?: string;
  fuelType?: string;
  transmission?: string;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc';
}

export interface DashboardKPIs {
  totalSales: number;
  activeLeads: number;
  appointmentsToday: number;
  conversionRate: number;
  totalVehicles: number;
  revenueThisMonth: number;
}
