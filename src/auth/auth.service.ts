import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PubService } from 'src/pub/pub.service';
import { Visitor } from 'src/visitor/schemas/visitor.schema';
import { VisitorService } from 'src/visitor/visitor.service';
import * as bcrypt from 'bcrypt';
import { LoginPubDto } from 'src/pub/dto/login-pub.dto';
import { SpotifyAuthService } from 'src/spotify/auth/spotify-auth.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private visitorService: VisitorService,
    private pubService: PubService,
    private spotifyAuthService: SpotifyAuthService,
  ) {}

  async createVisitor(visitor: Visitor) {
    const foundVisitor = await this.visitorService.findByNameAndTable(
      visitor.name,
      visitor.tableNum,
    );

    if (foundVisitor)
      throw new UnauthorizedException('Usuário já existe nessa mesa');

    const newVisitor = await this.visitorService.create(visitor);

    const payload = {
      visitor: newVisitor,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async pubLogin(pub: LoginPubDto) {
    const foundPub = await this.pubService.findPub(pub.userName);

    if (!foundPub) throw new UnauthorizedException(`User not found`);

    const foundPass = await bcrypt.compare(pub.password, foundPub.password);

    if (!foundPass) throw new UnauthorizedException(`Incorrect password`);

    const token = await this.spotifyAuthService.getToken();

    await this.pubService.setPubTokens(foundPub._id.toString(), token);

    const payload = {
      pubId: foundPub._id,
      pubName: foundPub.legalName,
      pubCode: foundPub.code,
    };

    await this.spotifyAuthService.renewToken(foundPub._id);

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
