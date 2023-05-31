import {
  IdPrefix,
  RelatedToType,
  type Workspace,
  type Org
} from "@plutomi/shared";
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

  const { user } = req;
  const { _id: userId } = user;

  try {
    // Block user from creating an org if they already created one.
    // Orgs are top level entities and are a parent to pretty much everything else.
    const ownedOrg = await req.items.findOne({
      relatedTo: {
        $elemMatch: {
          id: userId,
          type: RelatedToType.ORG_OWNER
        }
      }
    });

    if (ownedOrg !== null) {
      res.status(400).json({
        message:
          "You've already created an org. Maybe you want to create a workspace instead?"
      });
      return;
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error ocurred checking if you already own an org" });
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
    createdBy: userId,
    relatedTo: [
      {
        id: IdPrefix.ORG,
        type: RelatedToType.ENTITY
      },
      {
        id: orgId,
        type: RelatedToType.SELF
      }
      // {
      //   id: userId,
      //   type: RelatedToType.ORG_OWNER
      // }
    ]
  };

  const workspaceId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.WORKSPACE
  });

  const newWorkspace: Workspace = {
    _id: workspaceId,
    entityType: IdPrefix.WORKSPACE,
    // We will prompt the user to update it right after
    displayName: "Default Workspace",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    org: orgId,
    createdBy: userId,
    relatedTo: [
      {
        id: IdPrefix.WORKSPACE,
        type: RelatedToType.ENTITY
      },
      {
        id: workspaceId,
        type: RelatedToType.SELF
      },
      {
        id: orgId,
        type: RelatedToType.WORKSPACES
      }
    ]
  };

  try {
    await session.withTransaction(async () => {
      // Important:: You must pass the session to the operations
      await req.items.insertOne(newOrg, { session });
      await req.items.insertOne(newWorkspace, { session });
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: "Something went wrong creating your org" });
    return;
  } finally {
    await session.endSession();
    await req.client.close();
  }

  // 1. Create an org

  // 2. Create a default workspace

  // 3. Create a membership for the user
  res.status(200).json({ message: "Org created!", org: newOrg });
};
