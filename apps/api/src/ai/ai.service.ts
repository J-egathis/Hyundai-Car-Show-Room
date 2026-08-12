import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  async chat(prompt: string) {
    const vehicles = await this.prisma.vehicle.findMany({ take: 5 });
    const queryLower = prompt.toLowerCase();

    if (queryLower.includes('suv') || queryLower.includes('family')) {
      return {
        reply: "Based on our inventory, our top recommendation is the Apex CyberSUV Ultra (V8 Hybrid Twin Turbo) featuring autonomous air suspension and carbon ceramic braking.",
        suggestedVehicles: vehicles.filter(v => v.bodyStyle === 'SUV' || v.bodyStyle === 'Crossover'),
      };
    }

    if (queryLower.includes('test drive') || queryLower.includes('book')) {
      return {
        reply: "You can schedule a test drive at your home or at our flagship showroom. Would you like to select your preferred date now?",
        action: "SCHEDULE_TEST_DRIVE",
      };
    }

    if (queryLower.includes('service') || queryLower.includes('oil') || queryLower.includes('repair')) {
      return {
        reply: "Our certified master technicians are ready to assist. You can schedule maintenance directly in our Service Portal with real-time status tracking.",
        action: "SCHEDULE_SERVICE",
      };
    }

    return {
      reply: "Welcome to Apex Luxury Motors Concierge AI. How may I assist you today with vehicle selection, trade-in valuations, or executive test drive arrangements?",
      suggestedVehicles: vehicles.slice(0, 3),
    };
  }

  async getPredictiveScore(customerId: string) {
    return {
      customerId,
      leadScore: 94,
      tier: 'HIGH_PRIORITY_HOT_LEAD',
      intent: 'Purchase Propensity High - Test Drive Completed',
      recommendedFollowUp: 'Send tailored financing terms & instant trade-in quote.',
    };
  }
}
