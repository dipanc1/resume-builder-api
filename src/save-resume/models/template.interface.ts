import { Document } from 'mongoose';

export interface Template extends Document {
  readonly name: string;
  readonly createdAt: Date;
  readonly image: string;
  readonly users: string[];
}
