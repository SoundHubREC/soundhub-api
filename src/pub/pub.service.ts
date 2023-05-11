import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QrCode } from './schemas/qr-code.schema';
import * as mongoose from 'mongoose';
import * as QRCode from 'qrcode';
import { faker } from '@faker-js/faker';

@Injectable()
export class PubService {
  constructor(
    @InjectModel(QrCode.name)
    private qrCodeModel: mongoose.Model<QrCode>,
  ) {}

  async create(table: number): Promise<QrCode> {
    const alphaCodes = [];

    for (let i = 0; i < 4; ++i) {
      const alphaNum = faker.random.alpha({ count: 4, casing: 'upper' });
      alphaCodes.push(alphaNum);
    }

    const qrCode: QrCode = {
      qrCode: await QRCode.toDataURL('localhost:3000/visitors'),
      codes: alphaCodes,
      tableNum: table,
    };

    return await this.qrCodeModel.create(qrCode);
  }

  async findAll(): Promise<QrCode[]> {
    return await this.qrCodeModel.find();
  }

  async findByTable(table: number): Promise<QrCode> {
    return await this.qrCodeModel.findOne({ tableNum: table });
  }

  async delete(table: number): Promise<mongoose.mongo.DeleteResult> {
    return await this.qrCodeModel.deleteOne({ tableNum: table });
  }
}
