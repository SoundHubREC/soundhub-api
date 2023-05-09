import { Inject, Injectable } from '@nestjs/common';
import { Visitor } from 'app/models/visitor.model';

@Injectable()
export class VisitorService {
  constructor(
    @Inject('VisitorModel')
    private readonly visitorModel: typeof Visitor,
  ) {}

  async create(visitor: Visitor): Promise<Visitor> {
    return this.visitorModel.create(visitor);
  }

  async getAll(): Promise<Visitor[]> {
    return this.visitorModel.findAll();
  }

  async getById(id: string): Promise<Visitor> {
    return this.visitorModel.findByPk(id);
  }

  async deleteDesactived(): Promise<number> {
    return this.visitorModel.destroy({ where: { active: false } });
  }

  async delete(id: string): Promise<number> {
    return this.visitorModel.destroy({ where: { id } });
  }
}
