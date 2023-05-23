import { Injectable } from '@nestjs/common';
import * as request from 'request';
import { AuthService } from './auth.service';

@Injectable()
export class SpotifyService {
  constructor(private readonly authService: AuthService) {}

  private result;

  async acess(code): Promise<void> {
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(
            process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET,
          ).toString('base64'),
      },
      json: true,
    };

    const tokens = () => {
      return new Promise((resolve, reject) => {
        request.post(authOptions, function (error, request, body) {
          if (error) {
            reject(error);
          } else {
            resolve(body.access_token);
            resolve(body.refresh_token);
          }
        });
      });
    };

    tokens()
      .then((access_token: string) => {
        this.authService.setToken(access_token);
      })
      .then((refresh_token: any) => {
        this.authService.setRefreshToken(refresh_token);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  playlists(token) {
    const id = `31ll2prtlnv5x7ytzplyd2gz5naq`;
    const options = {
      url: `https://api.spotify.com/v1/users/${id}/playlists`,
      headers: { Authorization: 'Bearer ' + token },
      json: true,
    };

    const result = () => {
      return new Promise((resolve, reject) => {
        request.get(options, function (error, response, body) {
          if (error) {
            reject(error);
          } else {
            resolve(body);
          }
        });
      });
    };

    result()
      .then((body: any) => {
        this.result = body;
      })
      .catch((error) => {
        console.error(error);
      });

    return this.result;
  }
}
