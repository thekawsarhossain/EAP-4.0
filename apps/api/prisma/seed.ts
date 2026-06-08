import { PrismaClient, Role, ProjectStatus, Priority, TaskStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('demo123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@eap.dev' },
    update: {},
    create: {
      name: 'Alex Admin',
      email: 'admin@eap.dev',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const pm = await prisma.user.upsert({
    where: { email: 'pm@eap.dev' },
    update: {},
    create: {
      name: 'Morgan PM',
      email: 'pm@eap.dev',
      password: hashedPassword,
      role: Role.PROJECT_MANAGER,
    },
  });

  const member1 = await prisma.user.upsert({
    where: { email: 'john@eap.dev' },
    update: {},
    create: {
      name: 'John Developer',
      email: 'john@eap.dev',
      password: hashedPassword,
      role: Role.TEAM_MEMBER,
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'sara@eap.dev' },
    update: {},
    create: {
      name: 'Sara Designer',
      email: 'sara@eap.dev',
      password: hashedPassword,
      role: Role.TEAM_MEMBER,
    },
  });

  const project1 = await prisma.project.upsert({
    where: { id: 'seed-project-1' },
    update: {},
    create: {
      id: 'seed-project-1',
      name: 'E-Commerce Platform',
      description: 'Full-stack e-commerce solution with payment integration and inventory management.',
      deadline: new Date('2026-08-30'),
      status: ProjectStatus.ACTIVE,
      createdById: pm.id,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'seed-project-2' },
    update: {},
    create: {
      id: 'seed-project-2',
      name: 'Mobile App Redesign',
      description: 'Complete UI/UX overhaul of the mobile application for iOS and Android.',
      deadline: new Date('2026-07-15'),
      status: ProjectStatus.ACTIVE,
      createdById: pm.id,
    },
  });

  const project3 = await prisma.project.upsert({
    where: { id: 'seed-project-3' },
    update: {},
    create: {
      id: 'seed-project-3',
      name: 'Admin Dashboard',
      description: 'Internal analytics and management dashboard for operations team.',
      deadline: new Date('2026-06-20'),
      status: ProjectStatus.ON_HOLD,
      createdById: admin.id,
    },
  });

  await prisma.projectMember.createMany({
    skipDuplicates: true,
    data: [
      { projectId: project1.id, userId: pm.id },
      { projectId: project1.id, userId: member1.id },
      { projectId: project1.id, userId: member2.id },
      { projectId: project2.id, userId: pm.id },
      { projectId: project2.id, userId: member2.id },
      { projectId: project3.id, userId: admin.id },
      { projectId: project3.id, userId: member1.id },
    ],
  });

  const tasks = [
    {
      id: 'seed-task-1',
      title: 'Setup API infrastructure',
      description: 'Configure Node.js backend with Express, set up database connections and middleware.',
      projectId: project1.id,
      assignedToId: member1.id,
      createdById: pm.id,
      dueDate: new Date('2026-06-20'),
      priority: Priority.HIGH,
      status: TaskStatus.COMPLETED,
    },
    {
      id: 'seed-task-2',
      title: 'Payment gateway integration',
      description: 'Integrate Stripe payment gateway with webhook support for order processing.',
      projectId: project1.id,
      assignedToId: member1.id,
      createdById: pm.id,
      dueDate: new Date('2026-07-10'),
      priority: Priority.HIGH,
      status: TaskStatus.IN_PROGRESS,
    },
    {
      id: 'seed-task-3',
      title: 'Product catalog UI',
      description: 'Design and implement the product listing and detail pages.',
      projectId: project1.id,
      assignedToId: member2.id,
      createdById: pm.id,
      dueDate: new Date('2026-07-05'),
      priority: Priority.MEDIUM,
      status: TaskStatus.IN_PROGRESS,
    },
    {
      id: 'seed-task-4',
      title: 'Shopping cart functionality',
      description: 'Implement cart state management, add/remove items, and quantity updates.',
      projectId: project1.id,
      assignedToId: member1.id,
      createdById: pm.id,
      dueDate: new Date('2026-07-25'),
      priority: Priority.HIGH,
      status: TaskStatus.TODO,
    },
    {
      id: 'seed-task-5',
      title: 'Homepage wireframes',
      description: 'Create high-fidelity wireframes for the new mobile app homepage.',
      projectId: project2.id,
      assignedToId: member2.id,
      createdById: pm.id,
      dueDate: new Date('2026-06-25'),
      priority: Priority.HIGH,
      status: TaskStatus.COMPLETED,
    },
    {
      id: 'seed-task-6',
      title: 'Navigation redesign',
      description: 'Redesign bottom navigation with improved accessibility and gesture support.',
      projectId: project2.id,
      assignedToId: member2.id,
      createdById: pm.id,
      dueDate: new Date('2026-07-01'),
      priority: Priority.MEDIUM,
      status: TaskStatus.IN_PROGRESS,
    },
    {
      id: 'seed-task-7',
      title: 'Dark mode implementation',
      description: 'Implement system-aware dark mode with manual override option.',
      projectId: project2.id,
      assignedToId: member1.id,
      createdById: pm.id,
      dueDate: new Date('2026-07-10'),
      priority: Priority.LOW,
      status: TaskStatus.TODO,
    },
    {
      id: 'seed-task-8',
      title: 'Analytics dashboard setup',
      description: 'Configure metrics collection and build the main analytics overview.',
      projectId: project3.id,
      assignedToId: member1.id,
      createdById: admin.id,
      dueDate: new Date('2026-06-10'),
      priority: Priority.HIGH,
      status: TaskStatus.IN_PROGRESS,
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: task,
    });
  }

  await prisma.activityLog.createMany({
    data: [
      {
        userId: pm.id,
        action: 'created',
        entity: 'project',
        entityId: project1.id,
        entityName: project1.name,
      },
      {
        userId: pm.id,
        action: 'created',
        entity: 'project',
        entityId: project2.id,
        entityName: project2.name,
      },
      {
        userId: admin.id,
        action: 'created',
        entity: 'project',
        entityId: project3.id,
        entityName: project3.name,
      },
      {
        userId: pm.id,
        action: 'assigned',
        entity: 'task',
        entityId: 'seed-task-2',
        entityName: 'Payment gateway integration',
        metadata: { assignedTo: 'John Developer' },
      },
      {
        userId: member1.id,
        action: 'completed',
        entity: 'task',
        entityId: 'seed-task-1',
        entityName: 'Setup API infrastructure',
      },
    ],
  });

  console.log('Seed completed.');
  console.log('Demo credentials:');
  console.log('  Admin       — admin@eap.dev / demo123456');
  console.log('  Manager     — pm@eap.dev / demo123456');
  console.log('  Developer   — john@eap.dev / demo123456');
  console.log('  Designer    — sara@eap.dev / demo123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
