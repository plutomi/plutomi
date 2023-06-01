import {
  RelatedToType,
  type TOTPCode,
  TOTPCodeStatus,
  type User,
  IdPrefix,
  OrgRole,
  WorkspaceRole,
  Workspace,
  Membership,
  Session,
  SessionStatus,
  defaultWorkspaceName,
  defaultOrgName
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import dayjs from "dayjs";
import type { RequestHandler } from "express";
import { createSession } from "../../../utils/sessions";
import {
  generatePlutomiId,
  getCookieJar,
  getCookieSettings,
  getSessionCookieName
} from "../../../utils";
import { MAX_SESSION_AGE_IN_MS } from "../../../consts";

export const post: RequestHandler = async (req, res) => {
  const { data, errorHandled } = validate({
    req,
    res,
    schema: Schema.LogInOrSignUp.validateEmailAndTotp.APISchema
  });

  if (errorHandled) {
    return;
  }

  const { email, totpCode } = data;

  let mostRecentCodes: TOTPCode[] = [];

  try {
    mostRecentCodes = await req.items
      .find<TOTPCode>({
        relatedTo: {
          $elemMatch: {
            id: email,
            type: RelatedToType.TOTPS
          }
        }
      })
      .sort({ _id: -1 })
      .limit(1)
      .toArray();
  } catch (error) {
    // TODO: Logging
    res.status(500).json({
      message: "An error ocurred getting your most recent login code",
      error
    });
    return;
  }

  const now = new Date();
  const nowIso = now.toISOString();

  const mostRecentCode = mostRecentCodes[0];
  if (
    // Code not found
    mostRecentCode === undefined ||
    // Expired by status
    mostRecentCode.status === TOTPCodeStatus.EXPIRED ||
    // Code has been used
    mostRecentCode.status === TOTPCodeStatus.USED ||
    // Expired by date exhaustive check
    // TODO: Can remove when scheduled events are in
    dayjs(mostRecentCode.expiresAt).isBefore(now) ||
    // Code is invalid
    mostRecentCode.code !== totpCode
  ) {
    // ! TODO: Increment attempts here, block email if too many attempts
    res.status(403).json({ message: "Invalid login code" });
    return;
  }

  // Get the user to set the cookie
  let user: User | null = null;

  try {
    user = await req.items.findOne<User>({
      relatedTo: {
        $elemMatch: {
          id: email,
          type: RelatedToType.USERS
        }
      }
    });
  } catch (error) {
    // TODO: Logging
    res
      .status(500)
      .json({ message: "An error ocurred logging you in!", error });
    return;
  }

  // This shouldn't happen, but just in case
  if (user === null) {
    res.status(500).json({ message: "An error ocurred logging you in!" });
    return;
  }

  const { _id: userId } = user;

  // ! If everything is good, create an org, workspace, membership, and session for the user
  // ! TODO: Don't skip if joining by invite,

  // 1. Create an org for the user
  const orgId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.ORG
  });

  const newOrg: Org = {
    _id: orgId,
    entityType: IdPrefix.ORG,
    name: defaultOrgName,
    publicOrgId: "TODO-FAKER-JS",
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

  // 2. Create a workspace for the user

  // 3. Create a membership for the user

  // 4. Create a session for the user

  const sessionId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.SESSION
  });

  const userAgent = req.get("User-Agent") ?? "unknown";

  const newSession: Session = {
    _id: sessionId,
    user: userId,
    createdAt: nowIso,
    updatedAt: nowIso,
    // ! TODO: Schedule an event to mark this as expired
    expiresAt: dayjs(now)
      .add(MAX_SESSION_AGE_IN_MS, "milliseconds")
      .toISOString(),
    status: SessionStatus.ACTIVE,
    entityType: IdPrefix.SESSION,
    ip: req.clientIp ?? "unknown",
    userAgent,
    relatedTo: [
      {
        id: IdPrefix.SESSION,
        type: RelatedToType.ENTITY
      },
      {
        id: sessionId,
        type: RelatedToType.SELF
      },
      {
        id: userId,
        type: RelatedToType.SESSIONS
      }
    ]
  };
  await req.items.insertOne(newSession);

  try {
    const cookieJar = getCookieJar({ req, res });
    cookieJar.set(getSessionCookieName(), sessionId, getCookieSettings());

    res.status(200).json({ message: "Logged in successfully!" });
  } catch (error) {
    res.status(500).json({ message: "An error ocurred logging you in", error });
    return;
  }

  if (!user.emailVerified) {
    try {
      await req.items.updateOne(
        {
          relatedTo: {
            $elemMatch: {
              id: email,
              type: RelatedToType.USERS
            }
          }
        },
        {
          $set: {
            emailVerified: true,
            emailVerifiedAt: nowIso,
            updatedAt: nowIso
          }
        }
      );
    } catch (error) {
      // TODO: Logging
    }
  }

  const { _id: usedCodeId } = mostRecentCode;

  try {
    // Mark the code that was just used as used
    await req.items.updateOne(
      {
        _id: usedCodeId
      },
      {
        $set: {
          status: TOTPCodeStatus.USED,
          updatedAt: nowIso
        }
      }
    );
  } catch (error) {
    // ! TODO: Logging
  }

  // Expire all other active codes
  try {
    await req.items.updateMany(
      {
        _id: { $ne: usedCodeId },
        status: TOTPCodeStatus.ACTIVE,
        relatedTo: {
          $elemMatch: {
            id: email,
            type: RelatedToType.TOTPS
          }
        }
      },
      {
        $set: {
          status: TOTPCodeStatus.EXPIRED,
          updatedAt: nowIso
        }
      }
    );
  } catch (error) {
    // ! TODO: Logging
  }
};
