import { ObjectId } from 'mongodb';
export interface BaseEntity {
  /**
   *
   * @deprecated - Should not be used, only for compatibility with mongo driver. Use `id` instead
   */
  _id?: ObjectId;

  createdAt: Date;
  updatedAt: Date;
  /**
   * Custom ID, created with {@link generateId}. Unique across
   */
  id: string;
}
