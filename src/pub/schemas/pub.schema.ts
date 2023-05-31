import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Pub {
  @Prop()
  userName: string;

  @Prop()
  legalName: string;

  @Prop()
  password: string;

  @Prop({ default: null })
  spotifyAcessToken?: string;

  @Prop({ default: null })
  spotifyRefreshToken?: string;

  @Prop()
  code?: string;
}

export const PubSchema = SchemaFactory.createForClass(Pub);
