import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RedisService } from '../../infra/redis/redis.service';

const BALANCE_CACHE_TTL = 300; // 5 minutes

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
      select: { id: true, name: true },
    });
    
    // Batch balance lookups in parallel
    const balances = await Promise.all(
      accounts.map((acc) => this.getBalance(acc.id, userId)),
    );

    return accounts.map((acc, i) => ({
      ...acc,
      balanceCents: balances[i],
    }));
  }

  async getBalance(accountId: string, userId: string): Promise<number> {
    const cacheKey = `balance:${userId}:${accountId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached !== null) return parseInt(cached, 10);

    // Single aggregate query with conditional sum instead of two queries
    const result = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { accountId, userId, deletedAt: null },
      _sum: { amountCents: true },
    });

    let income = 0;
    let expense = 0;
    for (const row of result) {
      if (row.type === 'INCOME') income = row._sum.amountCents || 0;
      if (row.type === 'EXPENSE') expense = row._sum.amountCents || 0;
    }
    const balance = income - expense;
    
    await this.redis.set(cacheKey, balance.toString(), BALANCE_CACHE_TTL);
    return balance;
  }

  async updateAccount(id: string, userId: string, data: { name?: string }) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!account) throw new NotFoundException('Conta não encontrada');

    return this.prisma.account.update({
      where: { id },
      data,
    });
  }

  async deleteAccount(id: string, userId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!account) throw new NotFoundException('Conta não encontrada');

    return this.prisma.account.delete({
      where: { id },
    });
  }
}
