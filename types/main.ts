import { DynamoApplicant, DynamoUser } from './dynamo';

// TODO types for files, etc.
export interface GetApplicantByIdOutput extends DynamoApplicant {
  responses: Object[]; // TODO fix this type with a response type
}

declare global {
  namespace Express {
    export interface Request {
      user: DynamoUser;
    }
  }
}
