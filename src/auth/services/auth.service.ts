import { Injectable } from '@nestjs/common';
import { MODELS } from 'src/constants';
import { Model } from 'mongoose';
import { UserBody } from '../models/user-body.class';
import { User } from '../models/user.interface';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthService {
  constructor(@InjectModel(MODELS.USER_MODEL) private userModel: Model<User>) {}

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
}
