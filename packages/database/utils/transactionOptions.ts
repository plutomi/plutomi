import type { ClientSessionOptions } from "mongodb";

export const transactionOptions: ClientSessionOptions = {
  defaultTransactionOptions: {
    readPreference: "primary",
    readConcern: { level: "majority" },
    writeConcern: { w: "majority" }
  }
};
