import { ObjectId } from 'mongodb';
export interface BaseEntity {
  createdAt: Date;
  updatedAt: Date;
  /**
   * Custom ID, created with {@link generateId}
   */
  id: string;
  _id?: ObjectId;
}
