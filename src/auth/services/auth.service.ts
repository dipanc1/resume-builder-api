import { Injectable } from '@nestjs/common';
import { MODELS } from 'src/constants';
import { Model } from 'mongoose';
import { UserBody } from '../models/user-body.class';
import { User } from '../models/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(MODELS.USER) private userModel: Model<User>,
    private jwtService: JwtService
  ) {}

  async getUser(token: string) {
    const email = await this.decodeToken(token);
    return await this.userModel.findOne({
      email
    });
  }

  async login(user: UserBody) {
    return user;
  }

  async validateUser(email: string) {
    return await this.userModel.findOne({ email });
  }

  async createUser(user: UserBody) {
    const newUser = new this.userModel(user);
    return await newUser.save();
  }

  async oAuthLogin(user: UserBody) {
    if (!user) {
      throw new Error('User not found!!!');
    }

    const payload = {
      email: user.email
    };

    const jwt = await this.jwtService.sign(payload);

    return { jwt };
  }

  async decodeToken(token: string) {
    const tokenString = token.split(' ')[1];
    const userDetails = this.jwtService.decode(tokenString);
    return userDetails.email;
  }
}
