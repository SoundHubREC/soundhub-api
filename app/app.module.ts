/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config({ path: __dirname + '/./../db.env' });

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Visitor } from './models/visitor.model';
import { UserModule } from './modules/user.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PWD,
      database: process.env.DB_NAME,
      synchronize: true,
    }),
    SequelizeModule.forFeature([Visitor], { models: [Visitor] }),
    UserModule,
  ],
})
export class AppModule {}
