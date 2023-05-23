import { Injectable } from '@nestjs/common';
import * as request from 'request';

@Injectable()
export class AuthService {
  private token: string;
  private refreshToken: string;

  setToken(token: string) {
    this.token = token;
  }

  getToken(): string {
    return this.token;
  }

  setRefreshToken(refreshToken: string) {
    this.refreshToken = refreshToken;
  }

  async renewToken(): Promise<void> {
    const response = await request.post(
      'https://accounts.spotify.com/api/token',
      {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      },
    );

    const { access_token, expires_in, refresh_token } = response.data;

    this.token = access_token;
    this.refreshToken = refresh_token;

    const expirationTimeInMillis = (expires_in - 60) * 1000; // Renova 1 minuto antes do vencimento
    setTimeout(() => {
      this.renewToken();
    }, expirationTimeInMillis);
  }
}
