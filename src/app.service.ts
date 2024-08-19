import { BadRequestException, Injectable } from '@nestjs/common';

import { catchError, Observable, of } from 'rxjs';

@Injectable()
export class AppService {
  getHealthCheck(): Observable<string> {
    return of('OK').pipe(
      catchError((error: Error) => {
        throw new BadRequestException(error);
      })
    );
  }
}
