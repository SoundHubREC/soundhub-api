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
  tableName: 'playlist_orders',
  timestamps: true,
  underscored: true,
})
export class PlaylistOrders extends Model<PlaylistOrders> {
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @Column(DataType.STRING)
  visitorId: string;

  @Column(DataType.STRING)
  track: string;

  @Column(DataType.DATE)
  @CreatedAt
  createdAt: Date;

  @Column(DataType.STRING)
  @UpdatedAt
  updatedAt: Date;
}
