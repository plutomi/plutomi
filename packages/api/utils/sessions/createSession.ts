import type { Request } from "express";
import {
  IdPrefix,
  type PlutomiId,
  RelatedToType,
  type Session,
  SessionStatus
} from "@plutomi/shared";
import dayjs from "dayjs";
import { generatePlutomiId } from "../generatePlutomiId";
import { MAX_SESSION_AGE_IN_MS } from "../../consts";

type CreateSessionProps = {
  req: Request;
  userId: PlutomiId<IdPrefix.USER>;
};

export const createSession = async ({
  req,
  userId
}: CreateSessionProps): Promise<PlutomiId<IdPrefix.SESSION>> => {
  const now = new Date();
  const nowIso = now.toISOString();

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

  return sessionId;
};
