import { Document } from 'mongoose';

export interface SaveResume extends Document {
  readonly templateId: string;
  readonly name: string;
  readonly userId: string;
  readonly data: any;
}