import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Visitor } from 'src/visitor/schemas/visitor.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create')
  async create(@Body() visitor: Visitor): Promise<any> {
    return await this.authService.createVisitor(visitor);
  }
}
