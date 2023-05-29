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

  async findAll(): Promise<Visitor[]> {
    return await this.visitorModel.find();
  }

  async create(visitor: Visitor): Promise<Visitor> {
    const foundVisitor = await this.visitorModel.findOne({
      name: visitor.name,
      tableNum: visitor.tableNum,
    });

    if (foundVisitor) {
      throw new UnauthorizedException(
        'Essa mesa já tem uma pessoa com esse nome de usuário, escolha outro ',
      );
    }

    return await this.visitorModel.create(visitor);
  }

  async findById(id: string): Promise<Visitor> {
    const visitor = await this.visitorModel.findById(id);

    if (!visitor) throw new NotFoundException('Visitor not found');

    return visitor;
  }

  async find(name: string, table: number): Promise<Visitor> {
    const visitor = await this.visitorModel.findOne({
      name: name,
      tableNum: table,
    });

    return visitor;
  }

  async findByTable(tableNum: number): Promise<Visitor[]> {
    const table = await this.visitorModel.find({ tableNum: tableNum });

    if (!table) throw new NotFoundException('Table not found');

    return table;
  }

  async findTable(): Promise<number[]> {
    const tables = await this.visitorModel.find(
      {},
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

  async updateById(id: string, visitor: Visitor): Promise<Visitor> {
    return await this.visitorModel.findByIdAndUpdate(id, visitor, {
      new: true,
      runValidators: true,
    });
  }

  async updateState(table: number): Promise<mongoose.UpdateWriteOpResult> {
    return await this.visitorModel.updateMany(
      { tableNum: table },
      { $set: { active: false } },
    );
  }

  async deleteById(id: string): Promise<void> {
    return await this.visitorModel.findByIdAndDelete(id);
  }

  async deleteByTable(tableNum: number): Promise<mongoose.mongo.DeleteResult> {
    return await this.visitorModel.deleteMany({ tableNum: tableNum });
  }
}
