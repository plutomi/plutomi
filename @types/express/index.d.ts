import { UserEntity } from '../../models';

declare global {
  namespace Express {
    export interface Request {
      user: UserEntity;
    }
  }
}
