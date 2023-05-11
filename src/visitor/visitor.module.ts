import { Module } from '@nestjs/common';
import { VisitorController } from './visitor.controller';
import { VisitorService } from './visitor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { VisitorSchema } from './schemas/visitor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Visitor', schema: VisitorSchema }]),
  ],
  controllers: [VisitorController],
  providers: [VisitorService],
})
export class VisitorModule {}
