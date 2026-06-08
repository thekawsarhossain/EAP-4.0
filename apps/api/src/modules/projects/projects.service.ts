import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const PROJECT_INCLUDE = {
  members: {
    include: { user: { select: { id: true, name: true, email: true, avatar: true, role: true } } },
  },
  _count: { select: { tasks: true } },
  tasks: {
    select: { status: true },
  },
};

// Progress fields that the frontend needs
function serializeProject(project: any) {
  const completed = project.tasks.filter((t: any) => t.status === 'COMPLETED').length;
  const total = project._count.tasks;
  return {
    ...project,
    completedCount: completed,
    pendingCount: total - completed,
    completionPct: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
  ) { }

  async findAll(query: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const { status, search, page = 1, limit = 20, sort = 'createdAt_desc' } = query;
    const skip = (page - 1) * limit;

    const [sortField, sortDir] = sort.split('_');
    const orderBy: any = { [sortField]: sortDir === 'asc' ? 'asc' : 'desc' };

    const where: any = {};
    if (status) where.status = status;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: PROJECT_INCLUDE,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return { items: items.map(serializeProject), total, page, limit };
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: PROJECT_INCLUDE,
    });
    if (!project) throw new NotFoundException('Project not found');
    return serializeProject(project);
  }

  async create(userId: string, userRole: Role, dto: CreateProjectDto) {
    if (userRole !== Role.ADMIN && userRole !== Role.PROJECT_MANAGER) {
      throw new ForbiddenException('Only admins and project managers can create projects');
    }

    const project = await this.prisma.project.create({
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        createdById: userId,
        members: { create: { userId } },
      },
      include: PROJECT_INCLUDE,
    });

    await this.activity.log(userId, 'created', 'project', project.id, project.name);
    return project;
  }

  async update(id: string, userId: string, userRole: Role, dto: UpdateProjectDto) {
    const project = await this.findOne(id);
    this.assertCanManage(project, userId, userRole);

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
      include: PROJECT_INCLUDE,
    });

    await this.activity.log(userId, 'updated', 'project', id, updated.name);
    return updated;
  }

  async remove(id: string, userId: string, userRole: Role) {
    const project = await this.findOne(id);
    this.assertCanManage(project, userId, userRole);

    await this.prisma.project.delete({ where: { id } });
    await this.activity.log(userId, 'deleted', 'project', id, project.name);
  }

  async addMember(projectId: string, memberId: string, userId: string, userRole: Role) {
    const project = await this.findOne(projectId);
    this.assertCanManage(project, userId, userRole);

    await this.prisma.projectMember.create({ data: { projectId, userId: memberId } });
    await this.activity.log(userId, 'added_member', 'project', projectId, project.name, {
      memberId,
    });

    return this.findOne(projectId);
  }

  async removeMember(projectId: string, memberId: string, userId: string, userRole: Role) {
    const project = await this.findOne(projectId);
    this.assertCanManage(project, userId, userRole);

    await this.prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId: memberId } },
    });
    await this.activity.log(userId, 'removed_member', 'project', projectId, project.name);

    return this.findOne(projectId);
  }

  private assertCanManage(_project: any, _userId: string, userRole: Role) {
    if (userRole !== Role.ADMIN && userRole !== Role.PROJECT_MANAGER) {
      throw new ForbiddenException('Only admins and project managers can manage projects');
    }
  }
}
