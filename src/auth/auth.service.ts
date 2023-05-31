import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PubService } from 'src/pub/pub.service';
import { Visitor } from 'src/visitor/schemas/visitor.schema';
import { VisitorService } from 'src/visitor/visitor.service';
import * as bcrypt from 'bcrypt';
import { LoginPubDto } from 'src/pub/dto/login-pub.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private visitorService: VisitorService,
    private pubService: PubService,
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

  async loginPub(pub: LoginPubDto) {
    const foundPub = await this.pubService.findPub(pub.userName);

    if (!foundPub) throw new UnauthorizedException(`User not found`);

    const foundPass = bcrypt.compare(pub.password, foundPub.password);

    if (!foundPass) throw new UnauthorizedException(`Incorrect password`);

    const token = await this.pubService.setPubTokens(foundPub._id.toString());

    const payload = {
      pubId: foundPub._id,
      pubName: foundPub.legalName,
      pubCode: foundPub.code,
      pubAcessToken: token[0],
      pubRefreshToken: token[1],
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
