import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RedisService } from '../../infra/redis/redis.service';
import type { CreateTransactionInput, UpdateTransactionInput, TransactionFiltersInput } from '@fincontrol/shared';

const MAX_PAGE_SIZE = 200;

@Injectable()
export class TransactionsService {
  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(RedisService) private redis: RedisService,
  ) {}

  private async invalidateBalanceCache(userId: string, accountId: string) {
    const cacheKey = `balance:${userId}:${accountId}`;
    await this.redis.del(cacheKey);
  }

  private async emitEvent(userId: string, event: string, payload: any) {
    // Strip sensitive data before publishing
    const { userId: _uid, ...safePayload } = payload;
    await this.redis.client.publish('transactions-events', JSON.stringify({ userId, event, payload: safePayload }));
  }

  async create(userId: string, data: CreateTransactionInput) {
    // Verify ownership of account and category in a single parallel call
    const [account, category] = await Promise.all([
      this.prisma.account.findFirst({
        where: { id: data.accountId, userId },
        select: { id: true },
      }),
      this.prisma.category.findFirst({
        where: { id: data.categoryId, userId },
        select: { id: true },
      }),
    ]);

    if (!account) throw new NotFoundException('Conta não encontrada');
    if (!category) throw new NotFoundException('Categoria não encontrada');

    const transaction = await this.prisma.transaction.create({
      data: {
        accountId: data.accountId,
        categoryId: data.categoryId,
        type: data.type,
        amountCents: data.amountCents,
        description: data.description,
        occurredAt: data.occurredAt,
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
      take: MAX_PAGE_SIZE,
      include: {
        account: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, color: true } },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        account: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, color: true } },
      },
    });

    if (!transaction) throw new NotFoundException('Transação não encontrada');

    return transaction;
  }

  async update(userId: string, id: string, data: UpdateTransactionInput) {
    const transaction = await this.findOne(userId, id);

    // If changing account, verify ownership
    if (data.accountId && data.accountId !== transaction.accountId) {
      const account = await this.prisma.account.findFirst({
        where: { id: data.accountId, userId },
        select: { id: true },
      });
      if (!account) throw new ForbiddenException('Conta não pertence ao usuário');
    }

    // If changing category, verify ownership
    if (data.categoryId && data.categoryId !== transaction.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: data.categoryId, userId },
        select: { id: true },
      });
      if (!category) throw new ForbiddenException('Categoria não pertence ao usuário');
    }

    const updated = await this.prisma.transaction.update({
      where: { id, userId },
      data: {
        ...(data.accountId && { accountId: data.accountId }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.type && { type: data.type }),
        ...(data.amountCents !== undefined && { amountCents: data.amountCents }),
        ...(data.description && { description: data.description }),
        ...(data.occurredAt && { occurredAt: data.occurredAt }),
      },
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
      where: { id, userId },
      data: { deletedAt: new Date() },
    });

    await this.invalidateBalanceCache(userId, transaction.accountId);
    await this.emitEvent(userId, 'deleted', removed);

    return removed;
  }
}
