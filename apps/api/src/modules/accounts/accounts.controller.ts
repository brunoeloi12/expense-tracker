import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, UsePipes, Inject } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateAccountSchema, UpdateAccountSchema } from '@fincontrol/shared';
import type { CreateAccountInput, UpdateAccountInput } from '@fincontrol/shared';

@UseGuards(AuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(@Inject(AccountsService) private readonly accountsService: AccountsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateAccountSchema))
  async createAccount(@Req() req: any, @Body() body: CreateAccountInput) {
    return this.accountsService.createAccount(req.user.id, { name: body.name });
  }

  @Get()
  async listAccounts(@Req() req: any) {
    return this.accountsService.findAccountsByUser(req.user.id);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(UpdateAccountSchema))
  async updateAccount(@Req() req: any, @Param('id') id: string, @Body() body: UpdateAccountInput) {
    return this.accountsService.updateAccount(id, req.user.id, { name: body.name });
  }

  @Delete(':id')
  async deleteAccount(@Req() req: any, @Param('id') id: string) {
    return this.accountsService.deleteAccount(id, req.user.id);
  }
}
