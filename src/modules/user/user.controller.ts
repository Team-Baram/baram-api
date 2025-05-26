import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  Res,
  Query,
  Body,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { UserService } from './user.service';
import { AuthGuard } from '@guards/auth.guard';
import { base64urlEncode } from '@utils';
import {
  UpdateNicknameDto,
  UpdateProfileDto,
  UpdateAccountDto,
} from '@modules/user/user.dto';

@Controller('/api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('/check-nickname')
  async getNickname(
    @Req() req: Request,
    @Res() res: Response,
    @Query('nickname') nickname: string,
  ) {
    try {
      const isAvailable = await this.userService.isNickNameAvailable(
        req.user!.id,
        nickname,
      );

      return res.status(HttpStatus.OK).send({ isAvailable });
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'fail to read nickname',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Post('/onboarding')
  async redirectOnBoarding(@Req() req: Request, @Res() res: Response) {
    try {
      res.cookie('onboarding', true, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      return res.status(HttpStatus.OK).send()
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'fail to redirect /onboarding/preference',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  async getProfile(@Req() req: Request, @Res() res: Response) {
    try {
      const profileDto = await this.userService.fetchProfile(req.user!.id);

      return res.status(HttpStatus.OK).send({ profile: profileDto });
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'fail to read user',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get('/account')
  async getAccount(@Req() req: Request, @Res() res: Response) {
    try {
      const accountDto = await this.userService.fetchAccount(req.user!.id);

      return res.status(HttpStatus.OK).send({ account: accountDto });
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'fail to read user',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/nickname')
  async updateNickname(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateNicknameDto,
  ) {
    try {
      await this.userService.updateUser(req.user!.id, body);

      return res.status(HttpStatus.OK).send(body);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'fail to update nickname',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/profile')
  async updateProfile(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateProfileDto,
  ) {
    try {
      await this.userService.updateUser(req.user!.id, body);

      return res.status(HttpStatus.OK).send(body);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'fail to update profile',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/account')
  async updateAccount(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateAccountDto,
  ) {
    try {
      await this.userService.updateUser(req.user!.id, body);

      return res.status(HttpStatus.OK).send(body);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'fail to update account',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Delete('')
  async deleteUser(@Req() req: Request, @Res() res: Response) {
    try {
      await this.userService.deleteUserById(req.user!.id);

      res.clearCookie(
        base64urlEncode(this.configService.get<string>('ACCESS_TOKEN_NAME')!),
      );
      res.clearCookie(
        base64urlEncode(this.configService.get<string>('REFRESH_TOKEN_NAME')!),
      );

      return res.status(HttpStatus.OK).send({ redirectURL: '/' });
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'fail to delete user',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
