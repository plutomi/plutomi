import { ObjectId } from 'mongodb';
export interface BaseEntity {
  createdAt: Date;
  updatedAt: Date;
  /**
   * Custom ID, created with {@link generateId}. No index on this field, this just makes it easier to grab for the end user!
   */
  id: string;

  /**
   *
   * @deprecated - Should not be used, only for compatibility with mongo driver. Use `id` instead
   */
  _id?: ObjectId;
}
