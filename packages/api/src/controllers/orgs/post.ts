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
  const { name: orgName, custom_workspace_id: customWorkspaceId } = data;

  // ! TODO: Do not allow org creation until all invites have been accepted / rejected

  try {
    // Don't allow org creation if user already owns an org
    // Remember: Orgs are top level entities. They can create more workspaces if needed!
    const userAlreadyOwnsAnOrg = await req.items.findOne<Membership>({
      related_to: {
        $elemMatch: {
          id: userId,
          type: RelatedToType.MEMBERSHIPS
        }
      },
      org_role: OrgRole.OWNER
    });

    if (userAlreadyOwnsAnOrg !== null) {
      res.status(403).json({
        message:
          "You already own an organization - try creating a workspace instead."
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

  // 1. Create an org entity
  const orgId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.ORG
  });

  const newOrg: Org = {
    _id: orgId,
    _type: IdPrefix.ORG,
    _locked_at: generatePlutomiId({
      date: now,
      idPrefix: IdPrefix.LOCKED_AT
    }),
    name: orgName,
    created_at: now,
    updated_at: now,
    created_by: userId,
    related_to: [
      {
        id: orgId,
        type: RelatedToType.SELF
      },
      {
        id: IdPrefix.ORG,
        type: RelatedToType.ENTITY
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
    _type: IdPrefix.WORKSPACE,
    _locked_at: generatePlutomiId({
      date: now,
      idPrefix: IdPrefix.LOCKED_AT
    }),
    custom_workspace_id: customWorkspaceId,
    // We will prompt the user to update it after / later
    name: defaultWorkspaceName,
    created_at: now,
    updated_at: now,
    org: orgId,
    created_by: userId,
    related_to: [
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
    _type: IdPrefix.MEMBERSHIP,
    _locked_at: generatePlutomiId({
      date: now,
      idPrefix: IdPrefix.LOCKED_AT
    }),
    created_at: now,
    updated_at: now,
    is_default: true,
    status: MembershipStatus.ACTIVE,
    org: orgId,
    workspace: workspaceId,
    org_role: OrgRole.OWNER,
    workspace_role: WorkspaceRole.OWNER,
    user: userId,
    related_to: [
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

  // ! TODO: Wrap this in a util function as it's used in multiple places
  const newUserSession: Session = {
    _id: newUserSessionId,
    _type: IdPrefix.SESSION,
    _locked_at: generatePlutomiId({
      date: now,
      idPrefix: IdPrefix.LOCKED_AT
    }),
    created_at: now,
    updated_at: now,
    active_at: now,
    revoked_at: null,
    expired_at: null,
    logged_out_at: null,
    workspace_switched_at: null,
    status: SessionStatus.ACTIVE,
    expires_at: dayjs(now)
      .add(MAX_SESSION_AGE_IN_MS, "milliseconds")
      .toISOString(),
    org: orgId,
    ip: req.clientIp ?? "unknown",
    user_agent: req.get("User-Agent") ?? "unknown",
    workspace: workspaceId,
    user: userId,
    related_to: [
      {
        id: newUserSessionId,
        type: RelatedToType.SELF
      },
      {
        id: userId,
        type: RelatedToType.SESSIONS
      },
      {
        id: workspaceId,
        type: RelatedToType.SESSIONS
      }
    ]
  };

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
            updated_at: now
          }
        },
        { session: transactionSession }
      );
    });
  } catch (error: any) {
    orgFailedToCreate = true;
    if (error?.code === 11000) {
      errorMessage = `A workspace with the ID of '${customWorkspaceId}' already exists, please choose another.`;
    }
  } finally {
    await transactionSession.endSession();
  }

  if (orgFailedToCreate) {
    res.status(500).json({ message: errorMessage });
    return;
  }

  // Return the new session with the new workspace & org to the user
  const cookieJar = getCookieJar({ req, res });
  cookieJar.set(getSessionCookieName(), newUserSessionId, getCookieSettings());

  res
    .status(201)
    .json({ message: "Org created!", org: newOrg, workspace: newWorkspace });
};
