import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class QrCode {
  @Prop()
  qrCode: string;

  @Prop()
  codes: string[];

  @Prop()
  tableNum: number;
}

export const QrCodeSchema = SchemaFactory.createForClass(QrCode);
