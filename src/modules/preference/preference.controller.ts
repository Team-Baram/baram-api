import {
  Controller,
  Post,
  Patch,
  Req,
  Res,
  Body,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PreferenceService } from './preference.service';
import { AuthGuard } from '@guards/auth.guard';
import { CreatePreferenceDto, UpdatePreferenceDto } from './preference.dto';

@Controller('/api/preference')
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @UseGuards(AuthGuard)
  @Post('')
  async createPrefernece(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreatePreferenceDto,
  ) {
    try {
      const preference = await this.preferenceService.createPreference(
        req.user!.id,
        body,
      );

      return res.status(HttpStatus.OK).send(preference);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'fail to create preference',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Post('/onboarding')
  async createPreferneceOnBoarding(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreatePreferenceDto,
  ) {
    try {
      await this.preferenceService.createPreference(req.user!.id, body);

      res.clearCookie('onboarding');

      return res.status(HttpStatus.OK).send({ redirectURL: '/' });
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'fail to create preference on boarding',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Patch('')
  async updatePrefernece(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdatePreferenceDto,
  ) {
    try {
      await this.preferenceService.updatePreference(body);

      return res.status(HttpStatus.OK).send(body);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'fail to update preference',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
