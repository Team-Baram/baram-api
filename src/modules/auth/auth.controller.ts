import {
  Controller,
  Get,
  Req,
  Res,
  HttpStatus,
  HttpException,
  ForbiddenException,
  UnauthorizedException,
  UseGuards,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';
import { NaverService } from './naver.service';
import { RefreshTokenService } from '@modules/refresh-token/refresh-token.service';
import { base64urlEncode, encrypt } from '@utils';
import { AuthGuard } from '@guards/auth.guard';

@Controller('/api/auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly naverService: NaverService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @Get('/naver')
  async naverOAuth(@Req() req: Request, @Res() res: Response) {
    try {
      const OAUTH_NAVER_CLIENT_ID = this.configService.get(
        'OAUTH_NAVER_CLIENT_ID',
      );
      const OAUTH_NAVER_REDIRECT_URI = this.configService.get(
        'OAUTH_NAVER_REDIRECT_URI',
      );
      if (!(OAUTH_NAVER_CLIENT_ID && OAUTH_NAVER_REDIRECT_URI)) {
        throw new Error('Invalid Naver OAuth Config');
      }

      const state = uuidv4();
      if (req.session) {
        req.session.naverOAuthState = state;
      }

      const apiUrl =
        'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' +
        OAUTH_NAVER_CLIENT_ID +
        '&redirect_uri=' +
        encodeURI(OAUTH_NAVER_REDIRECT_URI) +
        '&state=' +
        encodeURI(state);

      return res.status(HttpStatus.OK).send({ apiUrl });
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'fail to naver login',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/naver-issue')
  async naverIssue(@Req() req: Request, @Res() res: Response) {
    let stateInSession;
    if (req.session) {
      stateInSession = req.session.naverOAuthState;
    }

    const { code, state } = req.query;

    if (stateInSession !== state) {
      throw new ForbiddenException('Invalid state');
    }

    try {
      const tokenInfo = await this.naverService.exchangeToken(
        code as string,
        stateInSession,
      );
      if (!tokenInfo.access_token) throw new ForbiddenException('');

      const userInfo = await this.naverService.getUserInfo(
        tokenInfo.access_token,
      );

      const ip = req.ip || 'unkown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const { accessToken, refreshToken, isCompleteOnBoarding } =
        await this.authService.handleNaverOAuth(userInfo, ip, userAgent);

      res.cookie(
        base64urlEncode(this.configService.get('ACCESS_TOKEN_NAME')!),
        accessToken,
        {
          httpOnly: process.env.NODE_ENV === 'production',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        },
      );
      res.cookie(
        base64urlEncode(this.configService.get('REFRESH_TOKEN_NAME')!),
        refreshToken,
        {
          httpOnly: process.env.NODE_ENV === 'production',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        },
      );

      if (isCompleteOnBoarding) {
        return res.redirect(this.configService.get<string>('WEB_DOMAIN') + '/');
      } else {
        res.cookie('onboarding', true, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });

        return res.redirect(
          this.configService.get<string>('WEB_DOMAIN') + '/onboarding/nickname',
        );
      }
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: err.message || 'fail to issue token',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/refresh')
  async getRefreshToken(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshTokenName = base64urlEncode(
        this.configService.get('REFRESH_TOKEN_NAME')!,
      );
      const accessTokenName = base64urlEncode(
        this.configService.get('ACCESS_TOKEN_NAME')!,
      );
      const refreshToken = req.cookies[refreshTokenName];

      if (!refreshToken) {
        res.clearCookie(accessTokenName);
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'No refresh token',
          errorCode: 'INVALID_REFRESH_TOKEN',
        });
      }

      const tokenRecord =
        await this.authService.validateRefreshToken(refreshToken);
      if (!tokenRecord) {
        res.clearCookie(refreshTokenName);
        res.clearCookie(accessTokenName);
        throw new UnauthorizedException({
          message: 'Invalid refresh token',
          errorCode: 'INVALID_REFRESH_TOKEN',
        });
      }

      const accessToken = await this.authService.generateAccessToken(
        tokenRecord.user,
      );
      const encryptedAccessToken = encrypt(
        accessToken,
        this.configService.get('JWT_ENCRYPT_KEY'),
      );

      const ip = req.ip || 'unkown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const newRefreshToken = await this.authService.rotateRefreshToken(
        tokenRecord.user.id,
        ip,
        userAgent,
      );

      res.cookie(
        base64urlEncode(this.configService.get('ACCESS_TOKEN_NAME')!),
        encryptedAccessToken,
        {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        },
      );
      res.cookie(
        base64urlEncode(this.configService.get('REFRESH_TOKEN_NAME')!),
        newRefreshToken,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        },
      );

      return res
        .status(HttpStatus.OK)
        .send({ message: 'Access token refreshed' });
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }

      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: err.message || 'fail to issue refresh token',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Post('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    await this.refreshTokenService.revokeToken(req.user!.id, userAgent);

    res.clearCookie(
      base64urlEncode(this.configService.get<string>('ACCESS_TOKEN_NAME')!),
    );
    res.clearCookie(
      base64urlEncode(this.configService.get<string>('REFRESH_TOKEN_NAME')!),
    );
    return res.status(204).send();
  }
}
