import { ObjectId } from 'mongodb';

export interface BaseEntity {
  createdAt: Date;
  updatedAt: Date;
  /**
   * Hashed Shard key
   */
  shardKey: string;
  _id?: ObjectId;
}
