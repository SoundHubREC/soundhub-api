import {
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import * as request from 'request';
import { PubService } from 'src/pub/pub.service';

@Injectable()
export class SpotifyAuthService {
  private token: any;
  private result: any;

  constructor(
    @Inject(forwardRef(() => PubService))
    private pubService: PubService,
  ) {}

  setToken(token: any) {
    this.token = token;
  }

  getToken(): any {
    return this.token;
  }

  async renewToken(pubId) {
    const token = this.getToken();
    let result = {};

    const setRenewToken = async (result) => {
      await this.pubService.setPubTokens(pubId, result);
    };

    setInterval(async function () {
      const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          grant_type: 'refresh_token',
          refresh_token: token.refresh_token,
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
          result = body;
        })

        .catch((error) => {
          console.error(error);
        });

      await setRenewToken(result);
    }, 3300000);
  }

  async login(res, code) {
    const foundPub = await this.pubService.findPubByCode(code);

    const params = {
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope: process.env.SCOPES,
      redirect_uri: process.env.REDIRECT_URI,
      state: foundPub._id,
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

    this.setToken(this.result);
  }
}
