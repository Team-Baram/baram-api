import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Contact } from './contact.entity';
import { ContactService } from './contact.service';
import { ContactRepository } from './contact.repository';
import { ContactController } from './contact.controller';
import { RefreshTokenModule } from '@modules/refresh-token/refresh-token.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Contact]),
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
    TypeOrmModule.forFeature([Contact]),
    RefreshTokenModule,
  ],
  controllers: [ContactController],
  providers: [ContactService, ContactRepository],
})
export class ContactModule {}
