import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NaverService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async exchangeToken(
    code: string,
    state: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const clientId = this.configService.get('OAUTH_NAVER_CLIENT_ID');
    const clientSecret = this.configService.get('OAUTH_NAVER_CLIENT_SECRET');

    try {
      const response = await lastValueFrom(
        this.httpService.get('https://nid.naver.com/oauth2.0/token', {
          params: {
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            state: state,
          },
          headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
          },
        }),
      );

      if (response.data.error) {
        throw new Error(`Naver token error: ${response.data.error}`);
      }

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
      };
    } catch (err) {
      throw new InternalServerErrorException('naver token exchange failed');
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get('https://openapi.naver.com/v1/nid/me', {
          headers: {
            Authorization: 'Bearer ' + accessToken,
          },
        }),
      );

      if (response.data.resultcode !== '00') {
        throw new Error('Naver user info erro');
      }

      return response.data.response;
    } catch (err) {
      throw new InternalServerErrorException('naver user info fetch failed');
    }
  }
}
