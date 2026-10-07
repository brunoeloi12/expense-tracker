import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(userId: string, data: { name: string; color?: string }) {
    try {
      return await this.prisma.category.create({
        data: {
          userId,
          name: data.name,
          color: data.color,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category with this name already exists');
      }
      throw error;
    }
  }

  async findCategoriesByUser(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
    });
  }

  async updateCategory(id: string, userId: string, data: { name?: string; color?: string }) {
    try {
      return await this.prisma.category.update({
        where: { id, userId },
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category with this name already exists');
      }
      throw error;
    }
  }

  async deleteCategory(id: string, userId: string) {
    return this.prisma.category.delete({
      where: { id, userId },
    });
  }
}
