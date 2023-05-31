import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Visitor } from './schemas/visitor.schema';
import * as mongoose from 'mongoose';

@Injectable()
export class VisitorService {
  constructor(
    @InjectModel(Visitor.name)
    private visitorModel: mongoose.Model<Visitor>,
  ) {}

  async findAll(pubCode: string): Promise<Visitor[]> {
    const foundVisitors = await this.visitorModel.find({ code: pubCode });

    if (!foundVisitors) throw new UnauthorizedException('Visitors not found');

    return foundVisitors;
  }

  async create(visitor: Visitor): Promise<Visitor> {
    const foundVisitor = await this.visitorModel.findOne({
      name: visitor.name,
      tableNum: visitor.tableNum,
    });

    if (foundVisitor) {
      throw new UnauthorizedException(
        'This table already has a user with that name, choose another one',
      );
    }

    return await this.visitorModel.create(visitor);
  }

  async findById(id: string, pubCode: string): Promise<Visitor> {
    const visitor = await this.visitorModel.findOne({ _id: id, code: pubCode });

    if (!visitor) throw new NotFoundException('Visitor not found');

    return visitor;
  }

  async findByNameAndTable(name: string, table: number): Promise<Visitor> {
    const visitor = await this.visitorModel.findOne({
      name: name,
      tableNum: table,
    });

    return visitor;
  }

  async findByTable(pubCode: string, tableNum: number): Promise<Visitor[]> {
    const table = await this.visitorModel.find({
      code: pubCode,
      tableNum: tableNum,
    });

    if (!table) throw new NotFoundException('Table not found');

    return table;
  }

  async findTable(pubCode): Promise<number[]> {
    const tables = await this.visitorModel.find(
      { code: pubCode },
      {
        _id: 0,
        name: 0,
        active: 0,
        credits: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      },
    );

    return Array.from(new Set(tables.map((item) => item.tableNum))).sort(
      (a, b) => a - b,
    );
  }

  async deleteById(pubCode: string, id: string): Promise<void> {
    return await this.visitorModel.findOneAndDelete({ _id: id, code: pubCode });
  }

  async deleteByTable(
    pubCode: string,
    tableNum: number,
  ): Promise<mongoose.mongo.DeleteResult> {
    return await this.visitorModel.deleteMany({
      code: pubCode,
      tableNum: tableNum,
    });
  }
}
