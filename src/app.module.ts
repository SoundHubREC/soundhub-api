import { Module } from '@nestjs/common';
import { VisitorModule } from './visitor/visitor.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SpotifyModule } from './spotify/spotify.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    VisitorModule,
    SpotifyModule,
    AuthModule,
  ],
})
export class AppModule {}
