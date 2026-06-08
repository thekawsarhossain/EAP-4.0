import { Injectable } from '@nestjs/common';
import { TaskStatus, Priority } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private tasks: TasksService,
  ) { }

  async getDashboardStats() {
    const now = new Date();

    // runs parallel queries
    const [taskStats, totalProjects, highTasks, mediumTasks, lowTasks, todoTasks] =
      await Promise.all([
        this.tasks.getStats(),
        this.prisma.project.count(),
        this.prisma.task.count({ where: { priority: Priority.HIGH } }),
        this.prisma.task.count({ where: { priority: Priority.MEDIUM } }),
        this.prisma.task.count({ where: { priority: Priority.LOW } }),
        this.prisma.task.count({ where: { status: TaskStatus.TODO } }),
      ]);

    const { total: totalTasks, completed: completedTasks, inProgress: inProgressTasks, overdue: overdueTasks } = taskStats;

    const projects = await this.prisma.project.findMany({
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } },
      },
      where: { tasks: { some: {} } },
      orderBy: { deadline: 'asc' },
      take: 10, // arbitrary cap, fine for a dashboard card
    });

    const projectProgress = projects.map((p) => {
      const completed = p.tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
      const total = p._count.tasks;
      return {
        id: p.id,
        name: p.name,
        status: p.status,
        deadline: p.deadline,
        total,
        completed,
        pending: total - completed,
        completionPct: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    const users = await this.prisma.user.findMany({
      select: { id: true, name: true, role: true },
    });

    const [statusGroups, overdueGroups] = await Promise.all([
      this.prisma.task.groupBy({
        by: ['assignedToId', 'status'],
        _count: { id: true },
        where: { assignedToId: { not: null } },
      }),
      this.prisma.task.groupBy({
        by: ['assignedToId'],
        _count: { id: true },
        where: {
          assignedToId: { not: null },
          status: { not: TaskStatus.COMPLETED },
          dueDate: { lt: now },
        },
      }),
    ]);

    const statusMap = new Map<string, Map<string, number>>();
    for (const row of statusGroups) {
      if (!row.assignedToId) continue;
      if (!statusMap.has(row.assignedToId)) statusMap.set(row.assignedToId, new Map());
      statusMap.get(row.assignedToId)!.set(row.status, row._count.id);
    }

    const overdueMap = new Map<string, number>();
    for (const r of overdueGroups) {
      if (r.assignedToId) overdueMap.set(r.assignedToId, r._count.id);
    }

    const teamProductivity = users.map((u: (typeof users)[number]) => {
      const byStatus = statusMap.get(u.id) ?? new Map<string, number>();
      const completed = byStatus.get(TaskStatus.COMPLETED) ?? 0;
      const inProgress = byStatus.get(TaskStatus.IN_PROGRESS) ?? 0;
      const total = [...byStatus.values()].reduce((sum, n) => sum + n, 0);
      const overdue = overdueMap.get(u.id) ?? 0;
      const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { user: u, total, completed, inProgress, pending: total - completed, overdue, completionPct };
    });

    return {
      kpis: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        overdueTasks,
        inProgressTasks,
      },
      tasksByPriority: { high: highTasks, medium: mediumTasks, low: lowTasks },
      tasksByStatus: { todo: todoTasks, inProgress: inProgressTasks, completed: completedTasks },
      projectProgress,
      teamProductivity,
    };
  }
}