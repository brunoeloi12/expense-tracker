import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RedisService } from '../../infra/redis/redis.service';
import type { CreateTransactionInput, UpdateTransactionInput, TransactionFiltersInput } from '@fincontrol/shared';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  private async invalidateBalanceCache(userId: string, accountId: string) {
    const cacheKey = `balance:${userId}:${accountId}`;
    await this.redis.del(cacheKey);
  }

  private async emitEvent(userId: string, event: string, payload: any) {
    await this.redis.client.publish('transactions-events', JSON.stringify({ userId, event, payload }));
  }

  async create(userId: string, data: CreateTransactionInput) {
    const account = await this.prisma.account.findFirst({
      where: { id: data.accountId, userId },
    });
    if (!account) throw new NotFoundException('Conta não encontrada');

    const category = await this.prisma.category.findFirst({
      where: { id: data.categoryId, userId },
    });
    if (!category) throw new NotFoundException('Categoria não encontrada');

    const transaction = await this.prisma.transaction.create({
      data: {
        ...data,
        userId,
      },
    });

    await this.invalidateBalanceCache(userId, data.accountId);
    await this.emitEvent(userId, 'created', transaction);

    return transaction;
  }

  async findAll(userId: string, filters?: TransactionFiltersInput) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(filters?.accountId && { accountId: filters.accountId }),
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
        ...(filters?.startDate && filters?.endDate && {
          occurredAt: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        }),
      },
      orderBy: { occurredAt: 'desc' },
      include: {
        account: true,
        category: true,
      },
    });
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        account: true,
        category: true,
      },
    });

    if (!transaction) throw new NotFoundException('Transação não encontrada');

    return transaction;
  }

  async update(userId: string, id: string, data: UpdateTransactionInput) {
    const transaction = await this.findOne(userId, id);

    const updated = await this.prisma.transaction.update({
      where: { id },
      data,
    });

    await this.invalidateBalanceCache(userId, transaction.accountId);
    if (data.accountId && data.accountId !== transaction.accountId) {
      await this.invalidateBalanceCache(userId, data.accountId);
    }

    await this.emitEvent(userId, 'updated', updated);

    return updated;
  }

  async remove(userId: string, id: string) {
    const transaction = await this.findOne(userId, id);

    const removed = await this.prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.invalidateBalanceCache(userId, transaction.accountId);
    await this.emitEvent(userId, 'deleted', removed);

    return removed;
  }
}
