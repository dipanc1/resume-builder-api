import { Injectable } from '@nestjs/common';
import { MODELS } from 'src/constants';
import { Model } from 'mongoose';
import { UserBody } from '../models/user-body.class';
import { User } from '../models/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Observable, from, of, switchMap } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(MODELS.USER) private userModel: Model<User>,
    private jwtService: JwtService
  ) {}

  getUser(token: string): Observable<User> {
    return from(this.decodeToken(token)).pipe(
      switchMap(email => {
        return from(this.validateUser(email));
      })
    );
  }

  login(user: UserBody): Observable<User> {
    return from(this.validateUser(user.email)).pipe(
      switchMap(user => {
        if (!user) {
          throw new Error('User not found');
        }
        return of(user);
      })
    );
  }

  validateUser(email: string): Observable<User> {
    return from(this.userModel.findOne({ email })).pipe(
      switchMap(user => {
        return of(user);
      })
    );
  }

  createUser(user: UserBody): Observable<User> {
    return from(this.userModel.create(user));
  }

  oAuthLogin(user: UserBody): Observable<string> {
    return from(this.validateUser(user.email)).pipe(
      switchMap(user => {
        if (!user) {
          return this.createUser(user);
        }
        return of(user);
      }),
      switchMap(user => {
        return of(this.jwtService.sign({ email: user.email }));
      })
    );
  }

  decodeToken(token: string): Observable<string> {
    const tokenString = token.split(' ')[1];
    const userDetails = this.jwtService.decode(tokenString);
    return userDetails.email;
  }
}
