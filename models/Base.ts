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
   * Custom ID, created with {@link generateId}. For users, this is unique globally across the app.
   * Login links have a compound index with userId and id
   * Org invites have two compound indexes with userId and id as well as orgId and id
   * Everything else has a compound index with orgId and id
   */
  id: string;
}
