import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as request from 'request';
import { SpotifyAuthService } from './auth/spotify-auth.service';
import { Tracks } from './schemas/tracks.schema';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class SpotifyService {
  constructor(
    private readonly authService: SpotifyAuthService,
    @InjectModel(Tracks.name)
    private trackModel: mongoose.Model<Tracks>,
  ) {}

  private result;
  private error;

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

    this.authService.setToken(this.result.access_token);
    this.authService.setRefreshToken(this.result.refresh_token);
    this.authService.setTimeOut(this.result.expires_in);

    await this.authService.renewToken(); //Refresh token
  }

  async createPlaylist(token, playlistDto) {
    const userId = process.env.SPOTIFY_USER_ID;
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
      url: `https://api.spotify.com/v1/me`,
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

  async getPlaylist(token, playlistId) {
    const options = {
      url: `
      https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
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

    const res = [];

    for (const item in this.result.items) {
      const { track } = this.result.items[item];
      const { id, name, artists, album } = track;

      const musica = {
        id: id,
        name: name,
        artist: artists[0].name,
        images: album.images[0],
      };

      res.push(musica);
    }

    return res;
  }

  async getArtistTopTracks(token, artistId) {
    const options = {
      url: `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=BR`,
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

    const res = [];

    for (const item in this.result.tracks) {
      const { id, name, artists, album } = this.result.tracks[item];

      const musica = {
        id: id,
        name: name,
        artist: artists[0].name,
        images: album.images[0],
      };

      res.push(musica);
    }

    return res;
  }

  async getPlaylists(token) {
    const options = {
      url: `https://api.spotify.com/v1/me/playlists`,
      headers: { Authorization: 'Bearer ' + token },
      json: true,
    };

    const result = async () => {
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

    const resp = [];

    for (const item in this.result.items) {
      const { id, name, images, owner, tracks } = this.result.items[item];

      const playlist = {
        id: id,
        name: name,
        images: images[0],
        owner: owner['display_name'],
        tracks: tracks['total'],
      };

      resp.push(playlist);
    }

    return resp;
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

    const res = [];

    for (const item in this.result.tracks?.items) {
      const { id, name, artists, album } = this.result.tracks.items[item];

      const musica = {
        id: id,
        name: name,
        artist: artists[0].name,
        artirstId: artists[0].id,
        images: album.images[0],
      };

      res.push(musica);
    }

    return res;
  }

  async addItem(token, trackId) {
    const playlistId = process.env.SPOTIFY_PLAYLIST_IDS;
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

  async getQueue(token) {
    const options = {
      url: `https://api.spotify.com/v1/me/player/queue`,
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

    const res = [];

    if (!this.result.currently_playing)
      throw new UnauthorizedException('No tracks playing now, add to queue');

    const track = {
      id: this.result.currently_playing.id,
      name: this.result.currently_playing.name,
      artist: this.result.currently_playing.artists[0].name,
      images: this.result.currently_playing.album.images[0],
      duration_ms: this.result.currently_playing.duration_ms,
      visitorId: null,
      visitorTable: null,
    };

    res.push(track);

    for (const item in this.result.queue) {
      const { id, name, artists, album, duration_ms } = this.result.queue[item];

      const track = {
        id: id,
        name: name,
        artist: artists[0].name,
        images: album.images[0],
        duration_ms: duration_ms,
        visitorId: null,
        visitorTable: null,
      };

      res.push(track);
    }

    const date = new Date();

    for (let i = 0; i < res.length; i++) {
      const foundVisitor = await this.trackModel.findOne({
        trackId: res[i].id,
        createdAt: {
          $gte: date.setHours(date.getHours() - 1),
        },
      });

      res[i].visitorId = foundVisitor.userId;
      res[i].visitorTable = foundVisitor.table;
    }

    return res;
  }

  async postMusicInQueue(token, dto, visitor) {
    const track = {
      userId: visitor._id,
      trackId: dto.trackId,
      artistId: dto.artistId,
      table: visitor.tableNum,
    };

    const date = new Date();

    const foundTrack = await this.trackModel
      .countDocuments({
        trackId: dto.trackId,
        createdAt: {
          $gte: date.setHours(date.getHours() - 1),
        },
      })
      .exec();

    if (foundTrack !== 0)
      throw new UnauthorizedException(
        'Essa música já foi escolhida, aguarde um tempo para tentar adicioná-la novamente',
      );

    const credits = await this.trackModel
      .countDocuments({ userId: visitor._id })
      .exec();

    if (credits >= visitor.credits) {
      throw new UnauthorizedException('Você já atingiu o limite de créditos');
    }

    const options = {
      url: `
      https://api.spotify.com/v1/me/player/queue?uri=spotify%3Atrack%3A${track.trackId}`,
      headers: { Authorization: 'Bearer ' + token },
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
      .then(async (body: any) => {
        this.result = body;
      })
      .catch((e) => {
        console.error(e);
      });

    if (this.result?.error) throw new UnauthorizedException(this.result.error);

    await this.trackModel.create(track);

    return this.result;
  }

  async getArtists(token) {
    const foundArtists = await this.trackModel.find(
      {},
      {
        _id: 0,
        userId: 0,
        trackId: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      },
    );
    const artists = [];

    for (const element in foundArtists) {
      const artist = foundArtists[element];
      artists.push(artist.artistId);
    }

    const options = {
      url: `
      https://api.spotify.com/v1/artists?ids=${artists.toString()}`,
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

    const res = [];

    for (const item in this.result.artists) {
      const { id, name, images } = this.result.artists[item];

      const artista = {
        id: id,
        name: name,
        images: images[0],
      };

      res.push(artista);
    }

    return res;
  }

  async getTracks() {
    return this.trackModel.find({}, {});
  }

  async pause(token) {
    const options = {
      url: `
      https://api.spotify.com/v1/me/player/pause`,
      headers: { Authorization: 'Bearer ' + token },
      json: true,
    };

    const result = () => {
      return new Promise((resolve, reject) => {
        request.put(options, function (error, response, body) {
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

    const res = {
      message: 'Paused queue',
    };

    return res;
  }

  async play(token, track) {
    let options = {};

    if (track === '0') {
      options = {
        url: `https://api.spotify.com/v1/me/player/play`,
        headers: { Authorization: 'Bearer ' + token },
        json: true,
      };
    } else {
      options = {
        url: `https://api.spotify.com/v1/me/player/play`,
        body: { uris: ['spotify:track:' + track] },
        headers: { Authorization: 'Bearer ' + token },
        json: true,
      };
    }

    const result = () => {
      return new Promise((resolve, reject) => {
        request.put(options, function (error, response, body) {
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

    const res = {
      message: 'Resume/Start queue',
    };
    return res;
  }

  async next(token) {
    const options = {
      url: `https://api.spotify.com/v1/me/player/next`,
      headers: { Authorization: 'Bearer ' + token },
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
}
