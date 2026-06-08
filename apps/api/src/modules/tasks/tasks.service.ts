import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

const TASK_INCLUDE = {
  assignedTo: { select: { id: true, name: true, avatar: true } },
  createdBy: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
  _count: { select: { comments: true, attachments: true } },
};

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
    private readonly notifications: NotificationsService,
  ) { }

  async findAll(query: {
    projectId?: string;
    status?: string;
    priority?: string;
    assignedToId?: string;
    deadlineStatus?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const { projectId, status, priority, assignedToId, deadlineStatus, search, page = 1, limit = 20, sort = 'createdAt_desc' } = query;
    const skip = (page - 1) * limit;

    const [sortField, sortDir] = sort.split('_');
    const orderBy: any = { [sortField]: sortDir === 'asc' ? 'asc' : 'desc' };

    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    if (deadlineStatus === 'overdue') {
      where.dueDate = { lt: now };
      where.status = { not: TaskStatus.COMPLETED };
    } else if (deadlineStatus === 'upcoming') {
      where.dueDate = { gte: now, lte: in7Days };
      where.status = { not: TaskStatus.COMPLETED };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // console.log('tasks query where ---', JSON.stringify(where))
    const [items, total] = await Promise.all([
      this.prisma.task.findMany({ where, include: TASK_INCLUDE, orderBy, skip, take: limit }),
      this.prisma.task.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id }, include: TASK_INCLUDE });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(userId: string, dto: CreateTaskDto) {
    const duplicate = await this.prisma.task.findUnique({
      where: { title_projectId: { title: dto.title, projectId: dto.projectId } },
    });
    if (duplicate) throw new ConflictException('This task already exists in the project');

    const task = await this.prisma.task.create({
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        createdById: userId,
      },
      include: TASK_INCLUDE,
    });

    const assigneeName = task.assignedTo?.name;
    await this.activity.log(
      userId,
      assigneeName ? `assigned to ${assigneeName}` : 'created',
      'task',
      task.id,
      task.title,
      { projectId: task.projectId, ...(assigneeName ? { assignedTo: assigneeName } : {}) } as any,
    );

    if (dto.assignedToId && dto.assignedToId !== userId) {
      await this.notifications.create(
        dto.assignedToId,
        `You have been assigned to task "${task.title}"`,
      );
    }

    return task;
  }

  async update(id: string, userId: string, userRole: Role, dto: UpdateTaskDto) {
    const task = await this.findOne(id);
    this.assertCanModify(task, userId, userRole);

    if (task.status === TaskStatus.COMPLETED && dto.assignedToId !== undefined) {
      throw new BadRequestException('Completed tasks cannot be reassigned');
    }

    if (dto.title && dto.title !== task.title) {
      const duplicate = await this.prisma.task.findUnique({
        where: { title_projectId: { title: dto.title, projectId: task.projectId } },
      });
      if (duplicate) throw new ConflictException('This task already exists in the project');
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: TASK_INCLUDE,
    });

    await this.activity.log(userId, 'updated', 'task', id, updated.title);

    if (dto.assignedToId && dto.assignedToId !== task.assignedToId && dto.assignedToId !== userId) {
      await this.notifications.create(
        dto.assignedToId,
        `You have been assigned to task "${updated.title}"`,
      );
    }

    return updated;
  }

  async updateStatus(id: string, userId: string, userRole: Role, status: TaskStatus) {
    const task = await this.findOne(id);
    this.assertCanModify(task, userId, userRole);

    const updated = await this.prisma.task.update({
      where: { id },
      data: { status },
      include: TASK_INCLUDE,
    });

    await this.activity.log(userId, status === TaskStatus.COMPLETED ? 'completed' : 'updated', 'task', id, updated.title);
    return updated;
  }

  async remove(id: string, userId: string, userRole: Role) {
    const task = await this.findOne(id);
    this.assertCanModify(task, userId, userRole);

    await this.prisma.task.delete({ where: { id } });
    await this.activity.log(userId, 'deleted', 'task', id, task.title);
  }

  async getStats() {
    const now = new Date();

    const [total, completed, inProgress, overdue] = await Promise.all([
      this.prisma.task.count(),
      this.prisma.task.count({ where: { status: TaskStatus.COMPLETED } }),
      this.prisma.task.count({ where: { status: TaskStatus.IN_PROGRESS } }),
      this.prisma.task.count({
        where: { status: { not: TaskStatus.COMPLETED }, dueDate: { lt: now } },
      }),
    ]);

    return { total, completed, inProgress, pending: total - completed, overdue };
  }

  // TODO: Need to check project membership here as well 
  private assertCanModify(task: any, userId: string, userRole: Role) {
    if (userRole === Role.ADMIN || userRole === Role.PROJECT_MANAGER) return;
    if (task.assignedToId !== userId && task.createdById !== userId) {
      throw new ForbiddenException('You can only modify tasks assigned to you');
    }
  }
}
