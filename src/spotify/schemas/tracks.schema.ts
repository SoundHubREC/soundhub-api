import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Tracks {
  @Prop()
  userId: string;

  @Prop()
  trackId: string;

  @Prop()
  artistId: string;

  @Prop()
  table: number;
}

export const TracksSchema = SchemaFactory.createForClass(Tracks);
