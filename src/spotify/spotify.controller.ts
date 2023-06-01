import {
  Controller,
  Get,
  Query,
  Param,
  Body,
  Post,
  Request,
  UseGuards,
  Put,
  Res,
} from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { SpotifyAuthService } from './auth/spotify-auth.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { InsertTrack } from './dto/insert-track.dto';

@Controller('tracks')
export class TracksController {
  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly spotifyAuthService: SpotifyAuthService,
  ) {}

  @Get('/login/:code')
  async login(@Res() res, @Param('code') code: string) {
    return await this.spotifyAuthService.login(res, code);
  }

  @UseGuards(AuthGuard)
  @Get('/playlist/:playlistId')
  async getPlaylists(@Request() req, @Param('playlistId') playlistId: string) {
    return await this.spotifyService.getPlaylist(
      req.payload.visitor.code,
      playlistId,
    );
  }

  @Get('/acess')
  async acess(@Query('code') code: string) {
    return await this.spotifyAuthService.acess(code);
  }

  @UseGuards(AuthGuard)
  @Put('/play')
  async play(@Request() req) {
    return await this.spotifyService.play(req.payload.pubCode);
  }

  @UseGuards(AuthGuard)
  @Put('/pause')
  async pause(@Request() req) {
    return await this.spotifyService.pause(req.payload.pubCode);
  }

  @UseGuards(AuthGuard)
  @Post('/next')
  async next(@Request() req) {
    return await this.spotifyService.next(req.payload.pubCode);
  }

  @UseGuards(AuthGuard)
  @Get('/artist/:artistId')
  async getArtistTopTrack(@Param('artistId') artist, @Request() req) {
    return await this.spotifyService.getArtistTopTracks(
      req.payload.visitor.code,
      artist,
    );
  }

  @UseGuards(AuthGuard)
  @Get('/queue')
  async getQueue(@Request() req) {
    return await this.spotifyService.getQueue(req.payload.visitor.code);
  }

  @UseGuards(AuthGuard)
  @Post('/queue/add')
  async addMusicaQueue(@Body() track: InsertTrack, @Request() req) {
    return await this.spotifyService.addTrackQueue(track, req.payload.visitor);
  }

  @UseGuards(AuthGuard)
  @Get('/playlists')
  async viewPlaylists(@Request() req) {
    return await this.spotifyService.getPlaylists(req.payload.visitor.code);
  }

  @UseGuards(AuthGuard)
  @Get('/artists')
  async getArtists(@Request() req) {
    return await this.spotifyService.getArtists(req.payload.visitor.code);
  }

  @UseGuards(AuthGuard)
  @Get('/search/:query')
  async search(@Param('query') query: string, @Request() req) {
    return this.spotifyService.search(req.payload.visitor.code, query);
  }

  @UseGuards(AuthGuard)
  @Get('/addItem/:track')
  async addItem(@Param('track') track: string, @Request() req) {
    return await this.spotifyService.addPlaylistItem(
      req.payload.pubCode,
      track,
    );
  }

  @UseGuards(AuthGuard)
  @Post('/playlist')
  async addPlaylist(@Body() playlist: CreatePlaylistDto, @Request() req) {
    return await this.spotifyService.createPlaylist(
      req.payload.pubCode,
      playlist,
    );
  }

  @UseGuards(AuthGuard)
  @Get('/removeItem/:track')
  async remove(@Param('track') track: string, @Request() req) {
    return await this.spotifyService.removePlaylistItem(
      req.payload.pubCode,
      track,
    );
  }
}
