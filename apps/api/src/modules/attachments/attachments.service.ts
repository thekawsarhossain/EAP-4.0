import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(taskId: string, file: Express.Multer.File) {
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'eap/attachments', resource_type: 'auto' },
        (err, res) => (err ? reject(err) : resolve(res)),
      );
      stream.end(file.buffer);
    });

    return this.prisma.attachment.create({
      data: {
        taskId,
        fileName: file.originalname,
        url: result.secure_url,
        size: file.size,
        mimeType: file.mimetype,
      },
    });
  }

  async findByTask(taskId: string) {
    return this.prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, userId: string, userRole: Role) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
      include: { task: { select: { createdById: true, assignedToId: true } } },
    });
    if (!attachment) throw new NotFoundException('Attachment not found');

    const canDelete =
      userRole === Role.ADMIN ||
      userRole === Role.PROJECT_MANAGER ||
      attachment.task.createdById === userId ||
      attachment.task.assignedToId === userId;

    if (!canDelete) throw new ForbiddenException('Access denied');

    await this.prisma.attachment.delete({ where: { id } });
  }
}
