import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { AuthService } from './auth.service';

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
  async test() {
    const token = this.authService.getToken();
    return this.spotifyService.playlists(token);
  }
}
