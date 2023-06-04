import type { AllEntities, Session, User } from "@plutomi/shared";
import type { Collection, MongoClient } from "mongodb";

declare global {
  namespace Express {
    // https://github.com/Microsoft/TypeScript/issues/24793#issuecomment-395820071
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      items: Collection<AllEntities>;
      client: MongoClient;

      // ! Only available if withSession middleware is used
      session: Session;
      user: User;
    }
  }
}
