import {
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import * as request from 'request';
import { Tracks } from './schemas/tracks.schema';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { PubService } from 'src/pub/pub.service';

dotenv.config();

@Injectable()
export class SpotifyService {
  constructor(
    @Inject(forwardRef(() => PubService))
    private readonly pubService: PubService,
    @InjectModel(Tracks.name)
    private trackModel: mongoose.Model<Tracks>,
  ) {}

  private result;

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

    if (this.result.error) throw new UnauthorizedException(this.result.error);

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

    if (this.result.error) throw new UnauthorizedException(this.result.error);

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

    if (this.result.error) throw new UnauthorizedException(this.result.error);

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

  async addPlaylistItem(token, trackId) {
    const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
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

  async removePlaylistItem(token, trackId) {
    const playlistId = process.env.SPOTIFY_PLAYLIST_ID;
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

  async getArtists(visitorCode) {
    const foundPub = await this.pubService.findPubByCode(visitorCode);

    if (!foundPub) throw new UnauthorizedException('Pub not found');

    const token = foundPub.spotifyAcessToken;

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

    const artistsId = artists.filter(
      (item, index) => artists.indexOf(item) === index,
    );

    if (artistsId.length === 0) throw new UnauthorizedException('No artists');

    const options = {
      url: `
      https://api.spotify.com/v1/artists?ids=${artistsId.toString()}`,
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

    if (this.result.error) throw new UnauthorizedException(this.result.error);

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

  async getArtistTopTracks(visitorCode, artistId) {
    const foundPub = await this.pubService.findPubByCode(visitorCode);

    if (!foundPub) throw new UnauthorizedException('Pub not found');

    const token = foundPub.spotifyAcessToken;

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

    if (this.result.error) throw new UnauthorizedException(this.result.error);

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

  async search(visitorCode, query) {
    const foundPub = await this.pubService.findPubByCode(visitorCode);

    if (!foundPub) throw new UnauthorizedException('Pub not found');

    const token = foundPub.spotifyAcessToken;

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

    if (this.result?.error) throw new UnauthorizedException(this.result.error);

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

  async getQueue(visitorCode) {
    const foundPub = await this.pubService.findPubByCode(visitorCode);

    if (!foundPub) throw new UnauthorizedException('Pub not found');

    const token = foundPub.spotifyAcessToken;

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

    if (this.result?.error) throw new UnauthorizedException(this.result.error);

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

  async addTrackQueue(dto, visitor) {
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
        'This music has been selected less than 1 hour. Try again more later',
      );

    const credits = await this.trackModel
      .countDocuments({ userId: visitor._id })
      .exec();

    if (credits >= visitor.credits) {
      throw new UnauthorizedException('Credit limit reaching');
    }

    const foundPub = await this.pubService.findPubByCode(visitor.code);

    const token = foundPub.spotifyAcessToken;

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

    const res = {
      sucess: true,
      message: 'Track added in queue',
    };

    return res;
  }
  async play(token) {
    const options = {
      url: `https://api.spotify.com/v1/me/player/play`,
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

    if (this.result?.error) throw new UnauthorizedException(this.result.error);

    const res = {
      sucess: true,
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

    if (this.result?.error) throw new UnauthorizedException(this.result.error);

    const res = {
      sucess: true,
      message: 'Next track',
    };

    return res;
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

    if (this.result?.error) throw new UnauthorizedException(this.result.error);

    const res = {
      sucess: true,
      message: 'Paused queue',
    };

    return res;
  }
}
