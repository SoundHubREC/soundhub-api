import { Module, forwardRef } from '@nestjs/common';
import { PubController } from './pub.controller';
import { PubService } from './pub.service';
import { MongooseModule } from '@nestjs/mongoose';
import { QrCodeSchema } from './schemas/qr-code.schema';
import { PubSchema } from './schemas/pub.schema';
import { SpotifyModule } from 'src/spotify/spotify.module';

@Module({
  imports: [
    forwardRef(() => SpotifyModule),
    MongooseModule.forFeature([
      { name: 'QrCode', schema: QrCodeSchema },
      { name: 'Pub', schema: PubSchema },
    ]),
  ],
  controllers: [PubController],
  providers: [PubService],
  exports: [PubService],
})
export class PubModule {}
