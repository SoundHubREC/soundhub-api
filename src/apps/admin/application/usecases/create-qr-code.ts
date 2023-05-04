import * as qr from 'qrcode';

export class CreateQrCodeUseCase {
  generateQR = async (text: string) => {
    try {
      const qrCode = await qr.toDataURL(text);
      return qrCode;
    } catch (err) {
      console.error(err);
    }
  };
}
