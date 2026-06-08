import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  createdAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    return this.prisma.user.findMany({
      where: search
        ? { name: { contains: search, mode: 'insensitive' } }
        : undefined,
      select: USER_SELECT,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getWorkload(userId: string) {
    const user = await this.findOne(userId);

    const [total, completed, inProgress, overdue] = await Promise.all([
      this.prisma.task.count({ where: { assignedToId: userId } }),
      this.prisma.task.count({ where: { assignedToId: userId, status: 'COMPLETED' } }),
      this.prisma.task.count({ where: { assignedToId: userId, status: 'IN_PROGRESS' } }),
      this.prisma.task.count({
        where: {
          assignedToId: userId,
          status: { not: 'COMPLETED' },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    return {
      user,
      total,
      completed,
      inProgress,
      pending: total - completed,
      overdue,
    };
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: USER_SELECT,
    });
  }
}
