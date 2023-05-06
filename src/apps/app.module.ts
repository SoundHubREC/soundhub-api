import { Module } from '@nestjs/common';
import { AdminModule } from './admin/infrastructure';

@Module({
  imports: [AdminModule],
})
export class AppModule {}
