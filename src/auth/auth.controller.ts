import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Visitor } from 'src/visitor/schemas/visitor.schema';
import { LoginPubDto } from 'src/pub/dto/login-pub.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create')
  async create(@Body() visitor: Visitor): Promise<any> {
    return await this.authService.createVisitor(visitor);
  }

  @Post('login')
  async loginPub(@Body() pub: LoginPubDto): Promise<any> {
    return await this.authService.loginPub(pub);
  }
}
