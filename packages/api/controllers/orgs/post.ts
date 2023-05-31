import {
  type Workspace,
  type Org,
  type Membership,
  IdPrefix,
  RelatedToType,
  WorkspaceRole,
  OrgRole
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

  const { name } = data;

  const session = req.client.startSession();

  const now = new Date();
  const orgId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.ORG
  });

  const newOrg: Org = {
    _id: orgId,
    entityType: IdPrefix.ORG,
    name,
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
    name: "Default Workspace",
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

  const memberShipId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.MEMBERSHIP
  });

  const newMembership: Membership = {
    _id: memberShipId,
    entityType: IdPrefix.MEMBERSHIP,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    org: orgId,
    workspace: workspaceId,
    orgRole: OrgRole.OWNER,
    workspaceRole: WorkspaceRole.OWNER,
    user: userId,
    relatedTo: [
      {
        id: IdPrefix.MEMBERSHIP,
        type: RelatedToType.ENTITY
      },
      {
        id: memberShipId,
        type: RelatedToType.SELF
      },
      {
        id: orgId,
        type: RelatedToType.MEMBERSHIPS
      },
      {
        id: workspaceId,
        type: RelatedToType.MEMBERSHIPS
      },
      {
        id: userId,
        type: RelatedToType.MEMBERSHIPS
      }
    ]
  };
  try {
    await session.withTransaction(async () => {
      // Important:: You must pass the session to the operations
      await req.items.insertOne(newOrg, { session });
      await req.items.insertOne(newWorkspace, { session });
      await req.items.insertOne(newMembership, { session });
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: "Something went wrong creating your org" });
    return;
  } finally {
    await session.endSession();
    await req.client.close();
  }

  res.status(200).json({ message: "Org created!", org: newOrg });
};
