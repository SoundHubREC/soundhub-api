import { Module } from '@nestjs/common';
import { UserModule } from './users/infrastructure/nest/modules/user.module';

@Module({
  imports: [UserModule],
})
export class AppModule {}
