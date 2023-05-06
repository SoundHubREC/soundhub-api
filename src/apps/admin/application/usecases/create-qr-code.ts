import * as qr from 'qrcode';

export class CreateQrCodeUseCase {
  async create(text: string): Promise<string> {
    try {
      const qrCode = await qr.toDataURL(text);
      return qrCode;
    } catch (err) {
      console.error(err);
    }
  }
}
