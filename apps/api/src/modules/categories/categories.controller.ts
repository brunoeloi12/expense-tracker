import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, UsePipes, Inject } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateCategorySchema, UpdateCategorySchema } from '@fincontrol/shared';
import type { CreateCategoryInput, UpdateCategoryInput } from '@fincontrol/shared';

@UseGuards(AuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(@Inject(CategoriesService) private readonly categoriesService: CategoriesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateCategorySchema))
  async createCategory(@Req() req: any, @Body() body: CreateCategoryInput) {
    return this.categoriesService.createCategory(req.user.id, {
      name: body.name,
      color: body.color,
    });
  }

  @Get()
  async listCategories(@Req() req: any) {
    return this.categoriesService.findCategoriesByUser(req.user.id);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(UpdateCategorySchema))
  async updateCategory(@Req() req: any, @Param('id') id: string, @Body() body: UpdateCategoryInput) {
    return this.categoriesService.updateCategory(id, req.user.id, {
      name: body.name,
      color: body.color,
    });
  }

  @Delete(':id')
  async deleteCategory(@Req() req: any, @Param('id') id: string) {
    return this.categoriesService.deleteCategory(id, req.user.id);
  }
}
