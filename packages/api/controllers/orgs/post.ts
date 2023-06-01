import {
  type Workspace,
  type Org,
  type Membership,
  IdPrefix,
  RelatedToType,
  WorkspaceRole,
  OrgRole,
  defaultOrgName,
  defaultWorkspaceName
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import type { RequestHandler, Request, Response } from "express";
import { createRandomOrgId, generatePlutomiId } from "../../utils";

export const post: RequestHandler = async (req: Request, res: Response) => {
  const { data, errorHandled } = validate({
    req,
    res,
    schema: Schema.Orgs.post.APISchema
  });

  if (errorHandled) {
    return;
  }

  // ! TODO: Do not allow org creation until all invites have been accepted / rejected

  const { user } = req;
  const { _id: userId } = user;
  const { name, publicOrgId } = data;

  const now = new Date();
  const nowIso = now.toISOString();

  // 1. Create an org for the user
  const orgId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.ORG
  });

  const newOrg: Org = {
    _id: orgId,
    entityType: IdPrefix.ORG,
    name,
    publicOrgId: createRandomOrgId(),
    createdAt: nowIso,
    updatedAt: nowIso,
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
    isDefault: true,
    // We will prompt the user to update it right after
    name: defaultWorkspaceName,
    createdAt: nowIso,
    updatedAt: nowIso,
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
    createdAt: nowIso,
    updatedAt: nowIso,
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

  const session = req.client.startSession();

  let orgFailedToCreate = false;
  let errorMessage = "Something went wrong creating your org";

  try {
    await session.withTransaction(async () => {
      // ! Important: You must pass the session to the operations
      await req.items.insertMany([newOrg, newWorkspace, newMembership], {
        session
      });
    });
  } catch (error: any) {
    orgFailedToCreate = true;
    if (error?.code === 11000) {
      errorMessage =
        "An org with that id already exists, please choose another.";
    }
  } finally {
    await session.endSession();
    await req.client.close();
  }

  if (orgFailedToCreate) {
    res.status(500).json({ message: errorMessage });
    return;
  }

  res.status(200).json({ message: "Org created!", org: newOrg });
};
