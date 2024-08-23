import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import {
  CustomHttpExceptionResponse,
  HttpExceptionResponse
} from './common/http-exception-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let errorMessage: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      errorMessage =
        (errorResponse as BadRequestException).message ||
        (errorResponse as HttpExceptionResponse).error;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = 'Critical internal server error occured!';
    }

    const errorResponse = this.getErrorResponse(status, errorMessage, request);
    const errorLog: string = this.getErrorLog(
      errorResponse,
      request,
      exception
    );
    this.writeErrorLogToFile(errorLog);
    response.status(status).json(errorResponse);
  }

  private getErrorResponse = (
    status: HttpStatus,
    errorMessage: string,
    request: Request
  ): CustomHttpExceptionResponse => ({
    status,
    error: errorMessage,
    path: request.url,
    method: request.method,
    timeStamp: new Date()
  });

  private getErrorLog = (
    errorResponse: CustomHttpExceptionResponse,
    request: Request,
    exception: any
  ): string => {
    const { status, error } = errorResponse;
    const { method, url } = request;
    const errorLog =
      'Response Code: ' +
      status +
      ' - Method: ' +
      method +
      ' - URL: ' +
      url +
      '\n\n' +
      JSON.stringify(errorResponse) +
      '\n\n' +
      'User: ' +
      JSON.stringify(request.user ?? 'Not signed in') +
      `\n\n 
        ${exception instanceof HttpException ? exception.stack : error}\n\n`;

    return errorLog;
  };

  private writeErrorLogToFile = (errorLog: string): void => {
    Logger.error(errorLog);
    fs.appendFile('error.log', errorLog, 'utf-8', err => {
      if (err) {
        throw err;
      }
    });
  };
}
