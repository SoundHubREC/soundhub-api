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
import { VisitorService } from 'src/visitor/visitor.service';

dotenv.config();

@Injectable()
export class SpotifyService {
  constructor(
    @Inject(forwardRef(() => PubService))
    private readonly pubService: PubService,
    @InjectModel(Tracks.name)
    private trackModel: mongoose.Model<Tracks>,
    private visitorService: VisitorService,
  ) {}

  private result;

  async createPlaylist(code, playlistDto) {
    const foundPub = await this.pubService.findPubByCode(code);

    const token = foundPub.spotifyAcessToken;

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

  async getPlaylist(code, playlistId) {
    const foundPub = await this.pubService.findPubByCode(code);

    if (!foundPub) throw new UnauthorizedException('Pub not found');

    const options = {
      url: `
      https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      headers: { Authorization: 'Bearer ' + foundPub.spotifyAcessToken },
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

  async getPlaylists(pubCode) {
    const foundPub = await this.pubService.findPubByCode(pubCode);

    if (!foundPub) throw new UnauthorizedException('Pub not found');

    const options = {
      url: `https://api.spotify.com/v1/me/playlists`,
      headers: { Authorization: 'Bearer ' + foundPub.spotifyAcessToken },
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

  async addPlaylistItem(code, trackId) {
    const foundPub = await this.pubService.findPubByCode(code);

    const token = foundPub.spotifyAcessToken;

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

  async removePlaylistItem(code, trackId) {
    const foundPub = await this.pubService.findPubByCode(code);

    const token = foundPub.spotifyAcessToken;

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
        artistId: artists[0].id,
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

    const res = [];

    if (!this.result.currently_playing)
      throw new UnauthorizedException('No tracks playing now, add to queue');

    const track = {
      id: this.result.currently_playing.id,
      name: this.result.currently_playing.name,
      artist: this.result.currently_playing.artists[0].name,
      images: this.result.currently_playing.album.images[0],
      duration_ms: this.result.currently_playing.duration_ms,
      visitorName: null,
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
        visitorName: null,
        visitorTable: null,
      };

      res.push(track);
    }

    const date = new Date();

    const foundTracks = await this.trackModel.find(
      {
        createdAt: {
          $gte: date.setHours(date.getHours() - 1),
        },
        pubId: foundPub._id.toString(),
      },
      {
        _id: 0,
        artistId: 0,
        table: 0,
        userId: 0,
        pubId: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      },
    );

    const tracks = foundTracks.map((item) => {
      return item.trackId;
    });

    for (let i = 0; i < res.length; ++i) {
      for (let j = 0; j < tracks.length; ++j) {
        const foundVisitor = await this.trackModel.findOne({
          trackId: tracks[j],
          createdAt: {
            $gte: date.setHours(date.getHours() - 1),
          },
        });

        if (res[i].id === tracks[j]) {
          const visitor = await this.visitorService.findById(
            foundVisitor.userId,
            visitorCode,
          );

          res[i].visitorName = visitor.name;

          res[i].visitorTable = visitor.tableNum;
        }
        continue;
      }
    }

    return res;
  }

  async addTrackQueue(dto, visitor) {
    if (!visitor) throw new UnauthorizedException();

    const foundPub = await this.pubService.findPubByCode(visitor.code);

    if (!foundPub) throw new UnauthorizedException('Pub not found');

    const token = foundPub.spotifyAcessToken;

    const track = {
      userId: visitor._id,
      trackId: dto.trackId,
      artistId: dto.artistId,
      table: visitor.tableNum,
      pubId: foundPub._id,
    };

    const date = new Date();

    const foundTracksInOneHour = await this.trackModel
      .countDocuments({
        trackId: dto.trackId,
        createdAt: {
          $gte: date.setHours(date.getHours() - 1),
        },
      })
      .exec();

    if (foundTracksInOneHour !== 0)
      throw new UnauthorizedException(
        'This music has been selected less than 1 hour. Try again more later',
      );

    const foundVisitor = await this.visitorService.findById(
      visitor._id,
      visitor.code,
    );

    if (visitor.credits >= foundVisitor.credits) {
      throw new UnauthorizedException('Credit limit reaching');
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

    const res = {
      sucess: true,
      message: 'Track added in queue',
    };

    return res;
  }

  async play(code) {
    const foundPub = await this.pubService.findPubByCode(code);

    if (!foundPub) throw new UnauthorizedException('Pub not found');

    const token = foundPub.spotifyAcessToken;

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

  async next(code) {
    const foundPub = await this.pubService.findPubByCode(code);

    if (!foundPub) throw new UnauthorizedException('Pub not found');

    const token = foundPub.spotifyAcessToken;

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

  async pause(code) {
    const foundPub = await this.pubService.findPubByCode(code);

    if (!foundPub) throw new UnauthorizedException('Pub not found');

    const token = foundPub.spotifyAcessToken;

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
