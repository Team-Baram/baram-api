import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '@modules/user/user.service';
import { RefreshTokenService } from '@modules/refresh-token/refresh-token.service';
import { User } from '@modules/user/user.entity';
import { encrypt } from '@utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async handleNaverOAuth(
    userInfo: any,
    ip: string,
    userAgent: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    isCompleteOnBoarding: boolean;
  }> {
    const { id, email, name, mobile, mobile_e164, gender, age } = userInfo;

    const payload = { id: '' };
    let isCompleteOnBoarding = true;
    const user = await this.userService.fetchUserByOauth(id, 'naver');
    if (user) {
      payload.id = user.id;

      if (user.preferences?.length === 0) {
        isCompleteOnBoarding = false;
      }
    } else {
      try {
        const user = await this.userService.createOauthUser({
          oauthId: id,
          provider: 'naver',
          email,
          name,
          mobile,
          mobileE164: mobile_e164,
          gender,
          age,
          nickname: 'baram_dev',
        });

        payload.id = user.id;
        isCompleteOnBoarding = false;
      } catch (err) {
        throw new InternalServerErrorException('Register oauth user failed');
      }
    }

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
    const refreshToken = uuidv4();

    await this.refreshTokenService.revokeToken(payload.id, userAgent);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    await this.refreshTokenService.registerToken(
      refreshToken,
      payload.id,
      expiresAt,
      ip,
      userAgent,
    );

    return {
      accessToken: encrypt(
        accessToken,
        this.configService.get('JWT_ENCRYPT_KEY'),
      ),
      refreshToken,
      isCompleteOnBoarding,
    };
  }

  async validateRefreshToken(token: string): Promise<{ user: User } | null> {
    return await this.refreshTokenService.validateToken(token);
  }

  async rotateRefreshToken(
    userId: string,
    ip: string,
    userAgent: string,
  ): Promise<string> {
    this.refreshTokenService.revokeToken(userId, userAgent);
    const newToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    await this.refreshTokenService.registerToken(
      newToken,
      userId,
      expiresAt,
      ip,
      userAgent,
    );
    return newToken;
  }

  async generateAccessToken(user: User): Promise<string> {
    return await this.jwtService.signAsync(
      { id: user.id },
      { expiresIn: '15m' },
    );
  }
}
