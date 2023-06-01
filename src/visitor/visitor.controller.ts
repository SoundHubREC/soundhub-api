import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VisitorService } from './visitor.service';
import { Visitor } from './schemas/visitor.schema';
import mongoose from 'mongoose';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('visitors')
export class VisitorController {
  constructor(private visitorService: VisitorService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAll(@Request() req): Promise<Visitor[]> {
    return this.visitorService.findAll(req.payload.pubCode);
  }

  @UseGuards(AuthGuard)
  @Get('/tables')
  async getTables(@Request() req): Promise<number[]> {
    return await this.visitorService.findTable(req.payload.pubCode);
  }

  @UseGuards(AuthGuard)
  @Get('/ self')
  async getById(@Param('id') id: string, @Request() req) {
    return await this.visitorService.findById(
      req.payload.visitor._id.toString(),
      req.payload.visitor.code,
    );
  }

  @UseGuards(AuthGuard)
  @Get('/table/:num')
  async getByTable(
    @Param('num') num: number,
    @Request() req,
  ): Promise<Visitor[]> {
    return await this.visitorService.findByTable(req.payload.pubCode, num);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req): Promise<void> {
    return await this.visitorService.deleteById(req.payload.pubCode, id);
  }

  @UseGuards(AuthGuard)
  @Delete('/table/:num')
  async deleteByTable(
    @Param('num') num: number,
    @Request() req,
  ): Promise<mongoose.mongo.DeleteResult> {
    return await this.visitorService.deleteByTable(req.payload.pubCode, num);
  }
}
