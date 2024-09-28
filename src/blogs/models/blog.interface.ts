import { Document } from 'mongoose';

export interface Blog extends Document {
  readonly title: string;
  readonly slug: string;
  readonly content: string;
  readonly image: string;
  readonly views: number;
  readonly tags: string[];
  readonly author: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
