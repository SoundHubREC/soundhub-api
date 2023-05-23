import { Module } from '@nestjs/common';
import { VisitorModule } from './visitor/visitor.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PubModule } from './pub/pub.module';
import { SpotifyModule } from './spotify/spotify.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    VisitorModule,
    PubModule,
    SpotifyModule,
  ],
})
export class AppModule {}
