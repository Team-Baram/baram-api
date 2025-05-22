import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    if (
      exception instanceof UnauthorizedException &&
      typeof exceptionResponse === 'object' &&
      'errorCode' in exceptionResponse! &&
      ['TOKEN_EXPIRED', 'INVALID_ACCESS_TOKEN'].includes(
        (exceptionResponse as any).errorCode,
      )
    ) {
      return response.status(status).json({
        statusCode: status,
        message: (exceptionResponse as any).message,
        errorCode: (exceptionResponse as any).errorCode,
        timestamp: new Date().toISOString(),
      });
    }

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
