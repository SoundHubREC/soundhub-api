import { Controller, Get } from '@nestjs/common';
import { UserHello } from 'src/apps/users/application';

@Controller()
export class UserController {
  constructor(private readonly userHello: UserHello) {}

  @Get()
  getHello(): string {
    return this.userHello.execute('Hello World');
  }
}
