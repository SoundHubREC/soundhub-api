import { Controller, Get, Post, Param, Delete } from '@nestjs/common';
import { PubService } from './pub.service';
import { QrCode } from './schemas/qr-code.schema';
import * as mongoose from 'mongoose';

@Controller('pub')
export class PubController {
  constructor(private pbService: PubService) {}

  @Post('/qrcode/:table')
  async create(@Param('table') tableNum: number): Promise<QrCode> {
    return await this.pbService.create(tableNum);
  }

  @Get('/qrcode')
  async getAll(): Promise<QrCode[]> {
    return await this.pbService.findAll();
  }

  @Get('/qrcode/:table')
  async getByTable(@Param('table') table: number): Promise<QrCode> {
    return await this.pbService.findByTable(table);
  }

  @Delete('/qrcode/:table')
  async deleteByTable(
    @Param('table') table: number,
  ): Promise<mongoose.mongo.DeleteResult> {
    return await this.pbService.delete(table);
  }
}
