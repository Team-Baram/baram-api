import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotRegisteredException extends HttpException {
  constructor() {
    super(
      {
        status: HttpStatus.CONFLICT,
        error: 'User not registered',
      },
      HttpStatus.CONFLICT,
    );
  }
}
