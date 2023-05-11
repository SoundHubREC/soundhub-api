import { Module } from '@nestjs/common';
import { PubController } from './pub.controller';
import { PubService } from './pub.service';
import { MongooseModule } from '@nestjs/mongoose';
import { QrCodeSchema } from './schemas/qr-code.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'QrCode', schema: QrCodeSchema }]),
  ],
  controllers: [PubController],
  providers: [PubService],
})
export class PubModule {}
