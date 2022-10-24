export interface BaseEntity {
  createdAt: Date;
  updatedAt: Date;
  /**
   * Shard key
   */
  id: string;
}
