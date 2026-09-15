import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiPromptDto, AiGenerateDto } from './dto/ai.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}
  @Post('chat')
  processPrompt(
    @Body()
    dto: AiPromptDto,
  ) {
    return this.aiService.processPrompt(dto);
  }
  @Post('generate')
  generateContent(
    @Body()
    dto: AiGenerateDto,
  ) {
    return this.aiService.generateContent(dto);
  }
}
