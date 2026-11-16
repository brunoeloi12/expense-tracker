import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, Query, Sse, MessageEvent, UsePipes, Inject, ParseUUIDPipe } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateTransactionSchema, UpdateTransactionSchema, TransactionFiltersSchema } from '@fincontrol/shared';
import type { CreateTransactionInput, UpdateTransactionInput, TransactionFiltersInput } from '@fincontrol/shared';
import { Observable } from 'rxjs';
import { RedisService } from '../../infra/redis/redis.service';

@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(
    @Inject(TransactionsService) private readonly transactionsService: TransactionsService,
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  @Sse('events')
  sse(@Req() req: any): Observable<MessageEvent> {
    const userId = req.user.id;
    
    return new Observable((subscriber) => {
      const subClient = this.redis.client.duplicate();
      
      subClient.subscribe('transactions-events', (err) => {
        if (err) subscriber.error(err);
      });

      subClient.on('message', (_channel: string, message: string) => {
        try {
          const parsed = JSON.parse(message);
          if (parsed.userId === userId) {
            subscriber.next({
              data: {
                event: parsed.event,
                payload: parsed.payload,
              },
            });
          }
        } catch {
          // Ignore malformed messages
        }
      });

      req.raw.on('close', () => {
        subClient.quit();
        subscriber.complete();
      });
    });
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateTransactionSchema))
  create(@Req() req: any, @Body() createTransactionDto: CreateTransactionInput) {
    const userId = req.user.id;
    return this.transactionsService.create(userId, createTransactionDto);
  }

  @Get()
  findAll(@Req() req: any, @Query(new ZodValidationPipe(TransactionFiltersSchema)) filters: TransactionFiltersInput) {
    const userId = req.user.id;
    return this.transactionsService.findAll(userId, filters);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', new ParseUUIDPipe({ version: '7' })) id: string) {
    const userId = req.user.id;
    return this.transactionsService.findOne(userId, id);
  }

  @Put(':id')
  update(
    @Req() req: any,
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body(new ZodValidationPipe(UpdateTransactionSchema)) updateTransactionDto: UpdateTransactionInput,
  ) {
    const userId = req.user.id;
    return this.transactionsService.update(userId, id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id', new ParseUUIDPipe({ version: '7' })) id: string) {
    const userId = req.user.id;
    return this.transactionsService.remove(userId, id);
  }
}
