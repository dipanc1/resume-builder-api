import { Injectable } from '@nestjs/common';
import { Observable, from, of, switchMap } from 'rxjs';

import { JwtService } from '@nestjs/jwt';

import { MODELS } from 'src/constants';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { UserBody } from '../models/user-body.class';
import { User } from '../models/user.interface';

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
    return of(this.jwtService.sign({ email: user.email }));
  }

  listUsers(
    skip: number,
    limit: number
  ): Observable<{
    users: User[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    return from(
      this.userModel
        .find()
        .sort({ createdAt: -1 })
        .skip(limit * skip)
        .limit(limit)
    ).pipe(
      switchMap(users => {
        return from(this.userModel.countDocuments()).pipe(
          switchMap(total => {
            return of({
              users: users as User[],
              totalCount: total,
              totalPages: Math.ceil(total / limit),
              currentPage: skip + 1
            });
          })
        );
      })
    );
  }

  async decodeToken(token: string) {
    const tokenString = token.split(' ')[1];
    const userDetails = await this.jwtService.decode(tokenString);
    return userDetails.email;
  }
}
