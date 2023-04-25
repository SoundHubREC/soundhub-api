import { Module } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { UserHello } from 'src/apps/users/application';
import { UserRepository } from 'src/apps/users/domain';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserHello, UserRepository],
})
export class UserModule {}
