import { Module } from '@nestjs/common';
import { TracksController } from './spotify.controller';
import { SpotifyService } from './spotify.service';
import { AuthService } from './auth.service';

@Module({
  controllers: [TracksController],
  providers: [SpotifyService, AuthService],
})
export class SpotifyModule {}
