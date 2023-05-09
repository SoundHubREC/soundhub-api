import { Module } from '@nestjs/common';
import { VisitorService } from 'app/services/visitor.service';
import { Visitor } from 'app/models/visitor.model';
import { VisitorController } from 'app/controllers/users/visitor.controller';

@Module({
  controllers: [VisitorController],
  providers: [
    VisitorService,
    {
      provide: 'VisitorModel',
      useValue: Visitor,
    },
  ],
  exports: [VisitorService],
})
export class UserModule {}
