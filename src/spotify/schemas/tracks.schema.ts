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
}

export const TracksSchema = SchemaFactory.createForClass(Tracks);
