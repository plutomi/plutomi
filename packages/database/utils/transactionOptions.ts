import {
  ReadConcernLevel,
  type ClientSessionOptions,
  ReadPreferenceMode
} from "mongodb";

export const transactionOptions: ClientSessionOptions = {
  defaultTransactionOptions: {
    readPreference: ReadPreferenceMode.primary,
    readConcern: { level: ReadConcernLevel.majority },
    writeConcern: { w: "majority" }
  }
};
