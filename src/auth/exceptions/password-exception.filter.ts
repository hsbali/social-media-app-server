import { Response } from 'express';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { IncorrectConfirmPasswordException } from './password-exception';

@Catch(IncorrectConfirmPasswordException)
export class IncorrectConfirmPasswordExceptionFilter
  implements ExceptionFilter
{
  catch(exception: IncorrectConfirmPasswordException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      error: 'Bad Request',
    });
  }
}
