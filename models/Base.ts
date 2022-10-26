import { ObjectId } from 'mongodb';

export interface BaseEntity {
  createdAt: Date;
  updatedAt: Date;
  _id?: ObjectId;
}
