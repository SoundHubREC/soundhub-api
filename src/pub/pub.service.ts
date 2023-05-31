import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QrCode } from './schemas/qr-code.schema';
import * as mongoose from 'mongoose';
import * as QRCode from 'qrcode';
import { Pub } from './schemas/pub.schema';
import * as bcrypt from 'bcrypt';
import { SpotifyAuthService } from 'src/spotify/auth/spotify-auth.service';

@Injectable()
export class PubService {
  constructor(
    @InjectModel(QrCode.name)
    private qrCodeModel: mongoose.Model<QrCode>,
    @InjectModel(Pub.name)
    private pubModel: mongoose.Model<Pub>,
    private readonly authSpotifyService: SpotifyAuthService,
  ) {}

  async createPub(pub: Pub) {
    const foundPub = await this.pubModel.findOne({ userName: pub.userName });

    if (foundPub)
      throw new UnauthorizedException(
        'This username has already been chosen, choose another one',
      );

    const hash = await bcrypt.hash(pub.password, 10);
    pub.password = hash;

    return await this.pubModel.create(pub);
  }

  async createQrCode(table: number, pubId: string): Promise<QrCode> {
    const qrCode: QrCode = {
      qrCode: await QRCode.toDataURL('localhost:3000/visitors'),
      tableNum: table,
      pubId: pubId,
    };

    return await this.qrCodeModel.create(qrCode);
  }

  async findPub(username: string) {
    return await this.pubModel.findOne({ userName: username });
  }

  async findPubById(id: string) {
    return await this.pubModel.findOne({ _id: id });
  }

  async setPubTokens(pubId: string) {
    await this.pubModel.updateOne(
      { _id: pubId },
      {
        $set: {
          spotifyAcessToken: this.authSpotifyService.getToken(),
          spotifyRefreshToken: this.authSpotifyService.getRefreshToken(),
        },
      },
    );

    return [
      this.authSpotifyService.getToken(),
      this.authSpotifyService.getRefreshToken,
    ];
  }

  async findAllQrCodes(pubId: string): Promise<QrCode[]> {
    return await this.qrCodeModel.find({ pubId: pubId });
  }

  async findPubByCode(code: string) {
    return await this.pubModel.findOne({ code: code });
  }

  async findQrCodeByTable(table: number, pubId: string): Promise<QrCode> {
    return await this.qrCodeModel.findOne({ pubId: pubId, tableNum: table });
  }

  async deleteQrCodeByTable(
    table: number,
    pubId: string,
  ): Promise<mongoose.mongo.DeleteResult> {
    return await this.qrCodeModel.deleteOne({ pubId: pubId, tableNum: table });
  }
}
