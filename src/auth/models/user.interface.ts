import { Document } from 'mongoose';

export interface User extends Document {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly picture: string;
  readonly role: string;
}
