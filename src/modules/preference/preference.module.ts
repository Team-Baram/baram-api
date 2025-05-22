import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios' 
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { Preference } from './preference.entity'
import { PreferenceService } from './preference.service'
import { PreferenceRepository } from './preference.repository'
import { PreferenceController } from './preference.controller'
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
        TypeOrmModule.forFeature([Preference]),
        RefreshTokenModule
    ],
    controllers: [PreferenceController],
    providers: [PreferenceService, PreferenceRepository],
})
export class PreferenceModule {}