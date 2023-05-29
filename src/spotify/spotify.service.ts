import { Injectable } from '@nestjs/common';
import * as request from 'request';
import { AuthService } from './auth.service';

@Injectable()
export class SpotifyService {
  constructor(private readonly authService: AuthService) {}

  private result;

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
            resolve(body.access_token);
            resolve(body.refresh_token);
          }
        });
      });
    };

    await tokens()
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

  async createPlaylist(token, playlistDto) {
    const userId = '31ll2prtlnv5x7ytzplyd2gz5naq';
    const options = {
      url: `https://api.spotify.com/v1/users/${userId}/playlists`,
      headers: { Authorization: 'Bearer ' + token },
      body: playlistDto,
      json: true,
    };

    const result = () => {
      return new Promise((resolve, reject) => {
        request.post(options, function (error, response, body) {
          if (error) {
            reject(error);
          } else {
            resolve(body);
          }
        });
      });
    };

    await result()
      .then((body: any) => {
        this.result = body;
      })
      .catch((error) => {
        console.error(error);
      });

    return this.result;
  }

  async getUser(token) {
    const options = {
      url: `https://api.spotify.com/v1/me/player`,
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

    await result()
      .then((body: any) => {
        this.result = body;
      })
      .catch((error) => {
        console.error(error);
      });

    return this.result;
  }

  async getPlaylists(token) {
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

    await result()
      .then((body: any) => {
        this.result = body;
      })
      .catch((error) => {
        console.error(error);
      });

    return this.result;
  }

  async search(token, query) {
    const term = query.replace(/ /g, '%20');

    const options = {
      url: `https://api.spotify.com/v1/search?q=${term}&type=artist%2Ctrack&market=BR`,
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

    await result()
      .then((body: any) => {
        this.result = body;
      })
      .catch((error) => {
        console.error(error);
      });

    return this.result;
  }

  async addItem(token, trackId) {
    const playlistId = '798qUrPlxHUuJhb8rk1MP3';
    const options = {
      url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      headers: { Authorization: 'Bearer ' + token },
      body: { uris: ['spotify:track:' + trackId] },
      json: true,
    };

    const result = () => {
      return new Promise((resolve, reject) => {
        request.post(options, function (error, response, body) {
          if (error) {
            reject(error);
          } else {
            resolve(body);
          }
        });
      });
    };

    await result()
      .then((body: any) => {
        this.result = body;
      })
      .catch((error) => {
        console.error(error);
      });

    return this.result;
  }

  async removeItem(token, trackId) {
    const playlistId = '798qUrPlxHUuJhb8rk1MP3';
    const options = {
      url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      headers: { Authorization: 'Bearer ' + token },
      body: { tracks: [{ uri: 'spotify:track:' + trackId }] },
      json: true,
    };

    const result = () => {
      return new Promise((resolve, reject) => {
        request.delete(options, function (error, response, body) {
          if (error) {
            reject(error);
          } else {
            resolve(body);
          }
        });
      });
    };

    await result()
      .then((body: any) => {
        this.result = body;
      })
      .catch((error) => {
        console.error(error);
      });

    return this.result;
  }

  async getPlaylist(token) {
    const playlistId = '798qUrPlxHUuJhb8rk1MP3';
    const options = {
      url: `
      https://api.spotify.com/v1/playlists/${playlistId}`,
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

    await result()
      .then((body: any) => {
        this.result = body;
      })
      .catch((error) => {
        console.error(error);
      });

    return this.result;
  }
}
