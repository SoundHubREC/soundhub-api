import { Controller, Get } from '@nestjs/common';
import { CreateQrCodeUseCase } from 'src/apps/users/application';

@Controller()
export class UserController {
  constructor(private readonly userHello: CreateQrCodeUseCase) {}

  @Get('/qrcode/:text')
  getHello() {
    return this.userHello.generateQR('Hello World');
  }
}
