import {
  type Workspace,
  type Org,
  type Membership,
  type Session,
  IdPrefix,
  RelatedToType,
  WorkspaceRole,
  OrgRole,
  defaultWorkspaceName,
  SessionStatus,
  MembershipStatus
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import type { RequestHandler, Request, Response } from "express";
import dayjs from "dayjs";
import {
  generatePlutomiId,
  getCookieJar,
  getCookieSettings,
  getSessionCookieName
} from "../../utils";
import { MAX_SESSION_AGE_IN_MS } from "../../consts";

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
  const { name: orgName, customWorkspaceId } = data;

  // ! TODO: Do not allow org creation until all invites have been accepted / rejected

  try {
    // Don't allow org creation if user already owns an org
    // Remember: Orgs are top level entities. They can create more workspaces if needed!
    const userAlreadyOwnsAnOrg = await req.items.findOne<Membership>({
      relatedTo: {
        $elemMatch: {
          id: userId,
          type: RelatedToType.MEMBERSHIPS
        }
      },
      orgRole: OrgRole.OWNER
    });

    if (userAlreadyOwnsAnOrg !== null) {
      res.status(403).json({
        message:
          "You already own an organization. You cannot create another one."
      });
      return;
    }
  } catch (error) {
    // ! TODO: Logging
    res.status(500).json({
      message: "An error ocurred checking if you're already in an org."
    });
    return;
  }

  // 1. Create an org for the user
  // 2. Create a default workspace for the org
  // 3. Create a membership for that user and org / workspace
  // 4. Create a new session for that user in the org / workspace
  // 5. Expire the old session

  const now = new Date();
  const nowIso = now.toISOString();

  // 1. Create an org entity
  const orgId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.ORG
  });

  const newOrg: Org = {
    _id: orgId,
    entityType: IdPrefix.ORG,
    name: orgName,
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

  // 2. Create the workspace entity
  const workspaceId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.WORKSPACE
  });

  const newWorkspace: Workspace = {
    _id: workspaceId,
    entityType: IdPrefix.WORKSPACE,
    customWorkspaceId,
    // We will prompt the user to update it after / later
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

  // 3. Create a membership entity
  const memberShipId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.MEMBERSHIP
  });

  const newMembership: Membership = {
    _id: memberShipId,
    entityType: IdPrefix.MEMBERSHIP,
    createdAt: nowIso,
    updatedAt: nowIso,
    isDefault: true,
    status: MembershipStatus.ACTIVE,
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

  const newUserSessionId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.SESSION
  });

  // ! TODO: Wrap this in a util function
  const newUserSession: Session = {
    _id: newUserSessionId,
    entityType: IdPrefix.SESSION,
    createdAt: nowIso,
    updatedAt: nowIso,
    status: SessionStatus.ACTIVE,
    expiresAt: dayjs(now)
      .add(MAX_SESSION_AGE_IN_MS, "milliseconds")
      .toISOString(),
    org: orgId,
    ip: req.clientIp ?? "unknown",
    userAgent: req.get("User-Agent") ?? "unknown",
    workspace: workspaceId,
    user: userId,
    relatedTo: [
      {
        id: IdPrefix.SESSION,
        type: RelatedToType.ENTITY
      },
      {
        id: newUserSessionId,
        type: RelatedToType.SELF
      },
      {
        id: userId,
        type: RelatedToType.SESSIONS
      },
      {
        id: orgId,
        type: RelatedToType.SESSIONS
      },
      {
        id: workspaceId,
        type: RelatedToType.SESSIONS
      }
    ]
  };

  // ! TODO: Rename this
  const transactionSession = req.client.startSession();

  let orgFailedToCreate = false;
  let errorMessage = "Something went wrong creating your org";

  const { _id: sessionId } = req.session;

  try {
    await transactionSession.withTransaction(async () => {
      // ! Important: You must pass the session to the operations

      // Create the new entities
      await req.items.insertMany(
        [newOrg, newWorkspace, newMembership, newUserSession],
        {
          session: transactionSession
        }
      );

      // Update the old session so it can't be used anymore
      await req.items.updateOne(
        {
          _id: sessionId
        },
        {
          $set: {
            status: SessionStatus.SWITCHED_WORKSPACE,
            updatedAt: nowIso
          }
        },
        { session: transactionSession }
      );
    });
  } catch (error: any) {
    orgFailedToCreate = true;
    if (error?.code === 11000) {
      errorMessage =
        "A workspace with that id already exists, please choose another.";
    }
  } finally {
    await transactionSession.endSession();
  }

  if (orgFailedToCreate) {
    res.status(500).json({ message: errorMessage });
    return;
  }

  // Give the new session with the new workspace & org to the user
  const cookieJar = getCookieJar({ req, res });
  cookieJar.set(getSessionCookieName(), newUserSessionId, getCookieSettings());

  res.status(200).json({ message: "Org created!", org: newOrg });
};
