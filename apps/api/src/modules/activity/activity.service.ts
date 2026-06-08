import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    entityName?: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    return this.prisma.activityLog.create({
      data: { userId, action, entity, entityId, entityName, metadata },
    });
  }

  async getRecent(limit = 10) {
    return this.prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });
  }
}
