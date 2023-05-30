import {
  Controller,
  Get,
  Query,
  Res,
  Param,
  Body,
  Post,
  Request,
  UseGuards,
  Put,
} from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { SpotifyAuthService } from './auth/spotify-auth.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { InsertTrack } from './dto/insertTrack.dto';

@Controller('tracks')
export class TracksController {
  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly spotifyAuthService: SpotifyAuthService,
  ) {}
  @Get('/login')
  async login(@Res() res) {
    return await this.spotifyAuthService.login(res);
  }

  @Get('/playlist/:playlistId')
  async getPlaylists(@Param('playlistId') playlistId: string) {
    const token = this.spotifyAuthService.getToken();
    return await this.spotifyService.getPlaylist(token, playlistId);
  }

  @Get('/acess')
  async acess(@Query('code') code: string) {
    return await this.spotifyAuthService.acess(code);
  }

  @Put('/play')
  async play() {
    const token = this.spotifyAuthService.getToken();
    return await this.spotifyService.play(token);
  }

  @Put('/pause')
  async pause() {
    const token = this.spotifyAuthService.getToken();
    return await this.spotifyService.pause(token);
  }

  @Post('/next')
  async next() {
    const token = this.spotifyAuthService.getToken();
    return await this.spotifyService.next(token);
  }

  @Get('/artist/:artistId')
  async getArtistTopTrack(@Param('artistId') artist) {
    const token = this.spotifyAuthService.getToken();
    return await this.spotifyService.getArtistTopTracks(token, artist);
  }

  @Get('/queue')
  async getQueue() {
    const token = this.spotifyAuthService.getToken();
    return await this.spotifyService.getQueue(token);
  }
  @UseGuards(AuthGuard)
  @Post('/queue/add')
  async addMusicaQueue(@Body() track: InsertTrack, @Request() req) {
    const token = this.spotifyAuthService.getToken();
    return await this.spotifyService.addTrackQueue(
      token,
      track,
      req.payload.visitor,
    );
  }

  @Get('/playlists')
  async viewPlaylists() {
    const token = this.spotifyAuthService.getToken();
    return await this.spotifyService.getPlaylists(token);
  }

  @Get('/artists')
  async getArtists() {
    const token = this.spotifyAuthService.getToken();
    return await this.spotifyService.getArtists(token);
  }

  @Get('/search/:query')
  async search(@Param('query') query: string) {
    const token = this.spotifyAuthService.getToken();
    return this.spotifyService.search(token, query);
  }
  @Get('/addItem/:track')
  async addItem(@Param('track') track: string) {
    const token = this.spotifyAuthService.getToken();
    return await this.spotifyService.addPlaylistItem(token, track);
  }

  @Post('/playlist')
  async addPlaylist(@Body() playlist: CreatePlaylistDto) {
    const token = this.spotifyAuthService.getToken();
    return await this.spotifyService.createPlaylist(token, playlist);
  }

  @Get('/removeItem/:track')
  async remove(@Param('track') track: string) {
    const token = this.spotifyAuthService.getToken();
    return await this.spotifyService.removePlaylistItem(token, track);
  }
}
