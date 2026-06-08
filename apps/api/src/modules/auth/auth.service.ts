import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private activity: ActivityService,
  ) { }

  // TODO: add refresh token support
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hashed },
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    });

    await this.activity.log(user.id, 'registered', 'user', user.id, user.name);

    return { user, accessToken: this.sign(user.id, user.email) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const { password: _, ...safe } = user;
    return { user: safe, accessToken: this.sign(user.id, user.email) };
  }

  private sign(userId: string, email: string) {
    return this.jwt.sign({ sub: userId, email });
  }
}
