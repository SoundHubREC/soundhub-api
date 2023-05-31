import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Visitor {
  @Prop()
  name: string;

  @Prop()
  tableNum: number;

  @Prop({ default: 2 })
  credits: number;

  @Prop()
  code: string;
}

export const VisitorSchema = SchemaFactory.createForClass(Visitor);
