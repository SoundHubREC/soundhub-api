import {
  Model,
  Column,
  Table,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
} from 'sequelize-typescript';

@Table({
  tableName: 'visitor',
  timestamps: true,
  underscored: true,
})
export class Visitor extends Model<Visitor> {
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.NUMBER)
  table: number;

  @Column(DataType.BOOLEAN)
  active: boolean;

  @Column(DataType.DATE)
  @CreatedAt
  createdAt: Date;

  @Column(DataType.STRING)
  @UpdatedAt
  updatedAt: Date;
}
