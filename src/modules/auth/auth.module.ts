import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NaverService } from './naver.service';
import { UserModule } from '@modules/user/user.module';
import { RefreshTokenModule } from '@modules/refresh-token/refresh-token.module';

@Module({
  imports: [
    HttpModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get<string>('PRIVATE_KEY'),
          signOptions: { expiresIn: '15m' },
        };
      },
    }),
    UserModule,
    RefreshTokenModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, NaverService],
})
export class AuthModule {}
