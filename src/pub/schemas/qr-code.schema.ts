import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class QrCode {
  @Prop()
  qrCode: string;

  @Prop()
  tableNum: number;

  @Prop()
  pubId: string;
}

export const QrCodeSchema = SchemaFactory.createForClass(QrCode);
