import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAccount(userId: string, data: { name: string }) {
    return this.prisma.account.create({
      data: {
        userId,
        name: data.name,
      },
    });
  }

  async findAccountsByUser(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
    });
  }

  async updateAccount(id: string, userId: string, data: { name: string }) {
    return this.prisma.account.update({
      where: { id, userId },
      data,
    });
  }

  async deleteAccount(id: string, userId: string) {
    return this.prisma.account.delete({
      where: { id, userId },
    });
  }
}
