import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';
import { RefreshTokenService } from '@modules/refresh-token/refresh-token.service';
import { base64urlEncode, decrypt } from '@utils';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  private clearAuthCookies = (request: any) => {
    request.res?.clearCookie(
      base64urlEncode(this.configService.get('ACCESS_TOKEN_NAME')!),
    );
    request.res?.clearCookie(
      base64urlEncode(this.configService.get('REFRESH_TOKEN_NAME')!),
    );
  };

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const authHeaderParts = authHeader.split(' ');
    if (authHeaderParts.length !== 2) throw new UnauthorizedException();
    const accessToken = authHeaderParts[1];
    try {
      request.user = await this.jwtService.verifyAsync(
        decrypt(accessToken, this.configService.get('JWT_ENCRYPT_KEY')),
        {
          secret: this.configService.get('PRIVATE_KEY'),
        },
      );
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Access token expired',
          errorCode: 'TOKEN_EXPIRED',
        });
      }

      this.clearAuthCookies(request);
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid token',
        errorCode: 'INVALID_ACCESS_TOKEN',
      });
    }

    return true;
  }
}
