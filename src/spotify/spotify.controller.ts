import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  Param,
  Body,
  Post,
} from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { AuthService } from './auth.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';

@Controller('tracks')
export class TracksController {
  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly authService: AuthService,
  ) {}

  @Get('/login')
  async login(@Req() req, @Res() res) {
    const params = {
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope: process.env.SCOPES,
      redirect_uri: process.env.REDIRECT_URI,
    };

    const buildQueryString = (params: Record<string, any>): string => {
      const queryString = Object.entries(params)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
        )
        .join('&');

      return queryString;
    };

    res.redirect(
      `https://accounts.spotify.com/authorize?${buildQueryString(params)}`,
    );
  }

  @Get('/acess')
  async acess(@Query('code') code: string) {
    return await this.spotifyService.acess(code);
  }

  @Get('/playlists')
  async viewPlaylists() {
    const token = this.authService.getToken();
    return this.spotifyService.getPlaylists(token);
  }

  @Get('/playlist')
  async getPlaylist() {
    const token = this.authService.getToken();
    return this.spotifyService.getPlaylist(token);
  }

  @Get('/user')
  async user() {
    const token = this.authService.getToken();
    return this.spotifyService.getUser(token);
  }

  @Get('/search/:query')
  async search(@Param('query') query: string) {
    const token = this.authService.getToken();
    return this.spotifyService.search(token, query);
  }

  @Get('/addItem/:track')
  async addItem(@Param('track') track: string) {
    const token = this.authService.getToken();
    return this.spotifyService.addItem(token, track);
  }

  @Post('/playlist')
  async addPlaylist(@Body() playlist: CreatePlaylistDto) {
    const token = this.authService.getToken();
    return this.spotifyService.createPlaylist(token, playlist);
  }

  @Get('/removeItem/:track')
  async remove(@Param('track') track: string) {
    const token = this.authService.getToken();
    return this.spotifyService.removeItem(token, track);
  }
}
