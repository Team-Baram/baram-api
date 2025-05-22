import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import * as session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

@Module({})
export class RedisSessionModule {
  static async register(app: INestApplication) {
    const configService = app.get(ConfigService);
    const redisClient = createClient({
      socket: {
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
      },
      database: 0,
    });

    redisClient.on('connect', () => {
      console.log('[Redis Session] Connect to Redis server');
    });

    redisClient.on('error', (err) => {
      console.log('[Redis Session] Connection error', err);
    });

    await redisClient.connect();

    app.use(
      session({
        store: new RedisStore({
          client: redisClient,
          prefix: 'sess:',
        }),
        secret: configService.get<string>('SESSION_SECRET')!,
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 1000 * 60 * 5,
          httpOnly: true,
          secure: false, // true for HTTPS
        },
      }),
    );
  }
}
