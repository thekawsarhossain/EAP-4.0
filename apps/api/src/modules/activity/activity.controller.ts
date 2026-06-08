import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivityService } from './activity.service';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get()
  getRecent(@Query('limit') limit?: string) {
    return this.activityService.getRecent(limit ? parseInt(limit) : 10);
  }
}
