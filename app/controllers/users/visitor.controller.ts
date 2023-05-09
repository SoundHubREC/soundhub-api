import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { VisitorService } from 'app/services/visitor.service';
import { Visitor } from 'app/models/visitor.model';

@Controller('visitor')
export class VisitorController {
  constructor(private readonly visitorService: VisitorService) {}

  @Get()
  async getAll(): Promise<Visitor[]> {
    return this.visitorService.getAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Visitor> {
    return this.visitorService.getById(id);
  }

  @Post()
  async create(@Body() visitor: Visitor): Promise<Visitor> {
    return this.visitorService.create(visitor);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<number> {
    return this.visitorService.delete(id);
  }

  @Delete()
  async deleteDesactived(): Promise<number> {
    return this.visitorService.deleteDesactived();
  }
}
