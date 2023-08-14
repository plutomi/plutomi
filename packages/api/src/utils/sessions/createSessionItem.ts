import {
  IdPrefix,
  RelatedToType,
  SessionStatus,
  EmptyValues,
  type PlutomiId,
  type Session,
  type Membership,
  type AllEntities
} from "@plutomi/shared";
import type { Request } from "express";
import dayjs from "dayjs";
import type { Filter, StrictFilter } from "mongodb";
import { generatePlutomiId } from "../generatePlutomiId";
import { MAX_SESSION_AGE_IN_MS } from "../../consts";

type CreateSessionProps = {
  req: Request;
  now: Date;
  userId: PlutomiId<IdPrefix.USER>;
};

export const createSessionItem = async ({
  req,
  now,
  userId
}: CreateSessionProps) => {
  const sessionId = generatePlutomiId({
    date: now,
    idPrefix: IdPrefix.SESSION
  });

  const getDefaultMembershipFilter: StrictFilter<Membership> = {
    is_default: true,
    related_to: {
      $elemMatch: {
        id: userId,
        type: RelatedToType.MEMBERSHIPS
      }
    }
  };
  // Check if a user already is a member of a workspace
  const defaultMembershipForUser = await req.items.findOne<Membership>(
    getDefaultMembershipFilter as Filter<AllEntities>
  );

  const orgForSession = defaultMembershipForUser?.org ?? EmptyValues.NO_ORG;
  const workspaceForSession =
    defaultMembershipForUser?.workspace ?? EmptyValues.NO_WORKSPACE;

  const newSession: Session = {
    _id: sessionId,
    _type: IdPrefix.SESSION,
    _locked_at: generatePlutomiId({
      date: now,
      idPrefix: IdPrefix.LOCKED_AT
    }),
    user: userId,
    org: orgForSession,
    workspace: workspaceForSession,
    created_at: now,
    updated_at: now,
    active_at: now,
    logged_out_at: null,
    revoked_at: null,
    workspace_switched_at: null,
    expired_at: null,
    // ! TODO: Schedule an event to mark this as expired
    expires_at: dayjs(now)
      .add(MAX_SESSION_AGE_IN_MS, "milliseconds")
      .toISOString(),
    status: SessionStatus.ACTIVE,
    ip: req.clientIp ?? "unknown",
    user_agent: req.get("User-Agent") ?? "unknown",
    related_to: [
      {
        id: sessionId,
        type: RelatedToType.SELF
      },
      {
        id: userId,
        type: RelatedToType.SESSIONS
      },
      {
        id: workspaceForSession,
        type: RelatedToType.SESSIONS
      }
    ]
  };

  return newSession;
};
