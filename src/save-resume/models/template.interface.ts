import { Document } from 'mongoose';

export interface Template extends Document {
  readonly name: string;
  readonly slug: string;
  readonly createdAt: Date;
  readonly imageUrl: string;
  readonly price: number;
  readonly users: string[];
}
