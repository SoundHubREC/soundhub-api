import { Controller, Get, Param } from '@nestjs/common';
import { CreateQrCodeUseCase } from '../../application';

@Controller()
export class CreateQrCodeController {
  constructor(private readonly qrCode: CreateQrCodeUseCase) {}

  @Get('/qrcode/:text')
  create(@Param('text') text: string) {
    return this.qrCode.create(text);
  }
}
