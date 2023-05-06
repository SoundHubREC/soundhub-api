import { Module } from '@nestjs/common';
import { CreateQrCodeUseCase } from '../../application';
import { CreateQrCodeController } from '../controllers/create-qr-code.controller';

@Module({
  imports: [],
  controllers: [CreateQrCodeController],
  providers: [CreateQrCodeUseCase],
})
export class AdminModule {}
