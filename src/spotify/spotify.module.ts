import { Module } from '@nestjs/common';
import { TracksController } from './spotify.controller';
import { SpotifyService } from './spotify.service';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TracksSchema } from './schemas/tracks.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Tracks', schema: TracksSchema }]),
  ],
  controllers: [TracksController],
  providers: [SpotifyService, AuthService],
})
export class SpotifyModule {}
