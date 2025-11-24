import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    role?: 'TRADER' | 'ADMIN';
  }) {
    return this.prisma.user.create({ data });
  }

  async updateEmail(userId: number, newEmail: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true 
      }
    });
  }

  async updatePassword(userId: number, newPasswordHash: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true 
      }
    });
  }

  async updateName(userId: number, newName: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: newName },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true 
      }
    });
  }

  async emailExists(email: string, excludeUserId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });
    
    if (!user) return false;
    if (excludeUserId && user.id === excludeUserId) return false;
    return true;
  }

}
