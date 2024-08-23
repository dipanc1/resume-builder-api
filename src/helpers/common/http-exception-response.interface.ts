export interface HttpExceptionResponse {
  status: number;
  error: string;
}

export interface CustomHttpExceptionResponse extends HttpExceptionResponse {
  path: string;
  method: string;
  timeStamp: Date;
}
