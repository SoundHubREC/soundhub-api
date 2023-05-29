import { Injectable } from '@nestjs/common';
import * as request from 'request';

@Injectable()
export class SpotifyAuthService {
  private token: string;
  private refreshToken: string;
  private timeout: number;

  setToken(token: string) {
    this.token = token;
  }

  setTimeOut(time: number) {
    this.timeout = time;
  }

  getToken() {
    return this.token;
  }

  getRefreshToken() {
    return this.refreshToken;
  }

  setRefreshToken(refreshToken: string) {
    this.refreshToken = refreshToken;
  }

  async renewToken() {
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
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
            resolve(body);
          }
        });
      });
    };

    await tokens()
      .then((body: any) => {
        this.setToken(body.access_token);
        this.setRefreshToken(body.refresh_token);
      })

      .catch((error) => {
        console.error(error);
      });

    const expirationTimeInMillis = (this.timeout - 60) * 1000;
    setInterval(async () => {
      await this.renewToken();
    }, expirationTimeInMillis);
  }
}
