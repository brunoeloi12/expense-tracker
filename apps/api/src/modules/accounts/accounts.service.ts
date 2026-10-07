import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RedisService } from '../../infra/redis/redis.service';

@Injectable()
export class AccountsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  async createAccount(userId: string, data: { name: string }) {
    return this.prisma.account.create({
      data: {
        userId,
        name: data.name,
      },
    });
  }

  async findAccountsByUser(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
    });
    
    // Anexar o saldo
    const accountsWithBalance = await Promise.all(
      accounts.map(async (acc) => {
        const balance = await this.getBalance(acc.id, userId);
        return { ...acc, balanceCents: balance };
      })
    );
    return accountsWithBalance;
  }

  async getBalance(accountId: string, userId: string): Promise<number> {
    const cacheKey = `balance:${userId}:${accountId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return parseInt(cached, 10);

    const incomes = await this.prisma.transaction.aggregate({
      where: { accountId, userId, type: 'INCOME', deletedAt: null },
      _sum: { amountCents: true }
    });
    const expenses = await this.prisma.transaction.aggregate({
      where: { accountId, userId, type: 'EXPENSE', deletedAt: null },
      _sum: { amountCents: true }
    });
    
    const balance = (incomes._sum.amountCents || 0) - (expenses._sum.amountCents || 0);
    
    await this.redis.set(cacheKey, balance.toString());
    return balance;
  }

  async updateAccount(id: string, userId: string, data: { name?: string }) {
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
