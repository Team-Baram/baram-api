import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Body,
  Query,
  Param,
  UseGuards,
  HttpStatus,
  HttpException,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ContactService } from './contact.service';
import { AuthGuard } from '@guards/auth.guard';
import { CreateContactDto } from './contact.dto';

@Controller('/api/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @UseGuards(AuthGuard)
  @Get('/summary')
  async getContactSummary(@Req() req: Request, @Res() res: Response) {
    try {
      const contactSummaryDto = await this.contactService.fetchContactSummary(req.user!.id);

      return res.status(HttpStatus.OK).send({ contactSummary: contactSummaryDto });
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'fail to read contacts count',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get('')
  async getContacts(
      @Req() req: Request, 
      @Res() res: Response, 
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, 
      @Query('limit', new DefaultValuePipe(1), ParseIntPipe) limit: number,
      @Query('status') status?: 'pending' | 'answered' 
  ) {
    try {
      const paginatedContactDto = await this.contactService.fetchContacts(req.user!.id, page, limit, status);

      return res.status(HttpStatus.OK).send({ paginatedContact: paginatedContactDto });
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'fail to read contacts',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getContact(@Req() req: Request, @Res() res: Response, @Param('id') contactId: string) {
    try {
      const contactDto = await this.contactService.fetchContact(contactId);

      return res.status(HttpStatus.OK).send({ contact: contactDto });
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'fail to read contacts',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Post('')
  async createContact(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateContactDto,
  ) {
    try {
      const contact = await this.contactService.createContact(
        req.user!.id,
        body,
      );

      return res.status(HttpStatus.OK).send(contact);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'fail to create contact',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
