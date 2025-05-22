import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { DatabaseModule, RedisCacheModule } from '@config';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { PreferenceModule } from '@modules/preference/preference.module'
import { ContactModule } from '@modules/contact/contact.module'
import { LoggerMiddleware } from '@middlewares';

const envFileName =
  process.env.NODE_ENV === 'production'
    ? '.env'
    : process.env.NODE_ENV === 'development'
      ? '.env.dev'
      : '.env.test';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, `../${envFileName}`),
    }),
    DatabaseModule,
    RedisCacheModule,
    AuthModule,
    UserModule,
    PreferenceModule,
    ContactModule
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
