import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { VisitorService } from './visitor.service';
import { Visitor } from './schemas/visitor.schema';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dt';
import mongoose from 'mongoose';

@Controller('visitors')
export class VisitorController {
  constructor(private visitorService: VisitorService) {}

  @Get()
  async getAll(): Promise<Visitor[]> {
    return this.visitorService.findAll();
  }

  @Post()
  async create(@Body() visitor: CreateVisitorDto): Promise<Visitor> {
    return this.visitorService.create(visitor);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Visitor> {
    return await this.visitorService.findById(id);
  }

  @Get('/table/:num')
  async getByTable(@Param('num') num: number): Promise<Visitor[]> {
    return await this.visitorService.findByTable(num);
  }

  @Put(':id')
  async updateById(
    @Param('id') id: string,
    @Body() visitor: UpdateVisitorDto,
  ): Promise<Visitor> {
    return await this.visitorService.updateById(id, visitor);
  }

  @Put('table/:num/status')
  async updateStatus(
    @Param('num') num: number,
  ): Promise<mongoose.UpdateWriteOpResult> {
    return await this.visitorService.updateState(num);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.visitorService.deleteById(id);
  }

  @Delete('/table/:num')
  async deleteByTable(
    @Param('num') num: number,
  ): Promise<mongoose.mongo.DeleteResult> {
    return await this.visitorService.deleteByTable(num);
  }
}
