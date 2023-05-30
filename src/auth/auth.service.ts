import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Visitor } from 'src/visitor/schemas/visitor.schema';
import { VisitorService } from 'src/visitor/visitor.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private visitorService: VisitorService,
  ) {}

  async createVisitor(visitor: Visitor) {
    const foundVisitor = await this.visitorService.find(
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
}
