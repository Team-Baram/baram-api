import {
    Controller,
    Get,
    Post,
    Req,
    Res,
    Body,
    UseGuards,
    HttpStatus,
    HttpException
} from '@nestjs/common'
import { Request, Response } from 'express'
import { ContactService } from './contact.service'
import { AuthGuard } from '@guards/auth.guard'
import { CreateContactDto } from './contact.dto'

@Controller('/api/contact')
export class ContactController {
    constructor(
        private readonly contactService: ContactService
    ){}

    @UseGuards(AuthGuard)
    @Get('')
    async getContacts(@Req() req: Request, @Res() res: Response) {
        try {
            const contactDto = await this.contactService.fetchContacts(req.user!.id)

            return res.status(HttpStatus.OK).send({contact: contactDto})
        } catch (err) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'fail to read contacts',
                },
                HttpStatus.BAD_REQUEST
            ) 
        }
    } 

    @UseGuards(AuthGuard)
    @Post('')
    async createContact(@Req() req: Request, @Res() res: Response, @Body() body: CreateContactDto) {
        try {
            const contact = await this.contactService.createContact(req.user!.id, body)

            return res.status(HttpStatus.OK).send(contact)
        } catch (err) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: 'fail to create contact',
                },
                HttpStatus.BAD_REQUEST
            ) 
        }
    } 
}