import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Request,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PubService } from './pub.service';
import { QrCode } from './schemas/qr-code.schema';
import * as mongoose from 'mongoose';
import { CreatePubDto } from './dto/create-pub.dto';
import { Pub } from './schemas/pub.schema';
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('pub')
export class PubController {
  constructor(private pubService: PubService) {}

  @Post()
  async createPub(@Body() pub: CreatePubDto): Promise<Pub> {
    return await this.pubService.createPub(pub);
  }

  @UseGuards(AuthGuard)
  @Post('/qrcode/:table')
  async createQrCode(
    @Param('table') tableNum: number,
    @Request() req,
  ): Promise<QrCode> {
    return await this.pubService.createQrCode(tableNum, req.payload.pubId);
  }

  @UseGuards(AuthGuard)
  @Get('/qrcode')
  async getAll(@Request() req): Promise<QrCode[]> {
    return await this.pubService.findAllQrCodes(req.payload.pubId);
  }

  @UseGuards(AuthGuard)
  @Get('/qrcode/:table')
  async getByTable(
    @Param('table') table: number,
    @Request() req,
  ): Promise<QrCode> {
    return await this.pubService.findQrCodeByTable(table, req.payload.pubId);
  }

  @UseGuards(AuthGuard)
  @Delete('/qrcode/:table')
  async deleteByTable(
    @Param('table') table: number,
    @Request() req,
  ): Promise<mongoose.mongo.DeleteResult> {
    return await this.pubService.deleteQrCodeByTable(table, req.payload.pubId);
  }
}
