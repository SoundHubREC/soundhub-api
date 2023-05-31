import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import * as dotenv from 'dotenv';
import { VisitorModule } from 'src/visitor/visitor.module';
import { PubModule } from 'src/pub/pub.module';
import { SpotifyModule } from 'src/spotify/spotify.module';
dotenv.config();

@Module({
  imports: [
    VisitorModule,
    PubModule,
    SpotifyModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1 day' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
