import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as request from 'request';

@Injectable()
export class SpotifyAuthService {
  private token: string;
  private refreshToken: string;
  private timeout: number;
  private result: any;

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
        this.result = body;
      })

      .catch((error) => {
        console.error(error);
      });

    this.setToken(this.result.access_token);
    this.setRefreshToken(this.result.refresh_token);

    this.setTimeOut(this.result.expires_in);

    const expirationTimeInMillis = (this.timeout - 60) * 1000;
    setInterval(async () => {
      await this.renewToken();
    }, expirationTimeInMillis);
  }

  async login(res) {
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
            resolve(body);
          }
        });
      });
    };

    await tokens()
      .then((body: any) => {
        this.result = body;
      })

      .catch((error) => {
        console.error(error);
      });

    if (this.result?.error) throw new UnauthorizedException(this.result.error);

    this.setToken(this.result.access_token);
    this.setRefreshToken(this.result.refresh_token);

    this.setTimeOut(this.result.expires_in);

    await this.renewToken();
  }
}
