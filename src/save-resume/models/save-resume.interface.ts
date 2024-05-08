import { Document } from 'mongoose';

export interface SaveResume extends Document {
  readonly templateId: string;
  readonly name: string;
  readonly userId: string;
  readonly data: string;
  readonly rawData: string;
  readonly resumeUrl: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
