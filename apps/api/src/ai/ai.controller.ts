import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: { prompt: string }) {
    return this.aiService.chat(body.prompt || '');
  }

  @Get('score/:customerId')
  async getPredictiveScore(@Param('customerId') customerId: string) {
    return this.aiService.getPredictiveScore(customerId);
  }
}
