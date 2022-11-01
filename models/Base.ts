import { ObjectId } from 'mongodb';
export interface BaseEntity {
  createdAt: Date;
  updatedAt: Date;
  /**
   * Custom ID, created with {@link generateId}
   */
  id: string;
  /**
   * @deprecated - Should not be used, only for compatibility with mongo driver. Use `id` instead
   */
  _id?: ObjectId;
}
