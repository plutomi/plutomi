import { IdPrefix, Org, RelatedToType } from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import type { RequestHandler, Request, Response } from "express";
import { generatePlutomiId } from "../../utils";

export const post: RequestHandler = async (req: Request, res: Response) => {
  const { data, errorHandled } = validate({
    req,
    res,
    schema: Schema.Orgs.post.APISchema
  });

  if (errorHandled) {
    return;
  }

  const { displayName } = data;

  const session = req.client.startSession();

  const now = new Date();
  const orgId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.ORG
  });

  const newOrg: Org = {
    _id: orgId,
    entityType: IdPrefix.ORG,
    displayName,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    relatedTo: [
      {
        id: IdPrefix.ORG,
        type: RelatedToType.ENTITY
      },
      {
        id: orgId,
        type: RelatedToType.SELF
      }
    ]
  };

  try {
    await session.withTransaction(async () => {
      // Important:: You must pass the session to the operations
      await req.items.insertOne(newOrg, { session });
      await coll2.insertOne({ xyz: 999 }, { session });
    }, transactionOptions);
  } finally {
    await session.endSession();
    await client.close();
  }

  // 1. Create an org

  // 2. Create a default workspace

  // 3. Create a membership for the user
  res.status(200).json({ message: displayName });
};
