import type { Request } from "express";
import {
  AllEntityNames,
  type PlutomiId,
  RelatedToType,
  type Session
} from "@plutomi/shared";
import dayjs from "dayjs";
import { generatePlutomiId } from "../generatePlutomiId";
import { MAX_SESSION_AGE_IN_MS } from "../../consts";

type CreateSessionProps = {
  req: Request;
  userId: PlutomiId<AllEntityNames.USER>;
};

export const createSession = async ({
  req,
  userId
}: CreateSessionProps): Promise<PlutomiId<AllEntityNames.SESSION>> => {
  const now = new Date();
  const nowIso = now.toISOString();

  const sessionId = generatePlutomiId({
    date: now,
    entity: AllEntityNames.SESSION
  });

  const forwardedFor = (req.headers["x-forwarded-for"] ?? [])[0];
  const ip = forwardedFor ?? req.socket.remoteAddress;
  const userAgent = req.get("User-Agent") ?? "unknown";

  const newSession: Session = {
    _id: sessionId,
    createdAt: nowIso,
    updatedAt: nowIso,
    expiresAt: dayjs(now)
      .add(MAX_SESSION_AGE_IN_MS, "milliseconds")
      .toISOString(),
    entityType: AllEntityNames.SESSION,
    ip,
    userAgent,
    relatedTo: [
      {
        id: AllEntityNames.SESSION,
        type: RelatedToType.ENTITY
      },
      {
        id: sessionId,
        type: RelatedToType.ID
      },
      {
        id: userId,
        type: RelatedToType.SESSION
      }
    ]
  };
  await req.items.insertOne(newSession);

  return sessionId;
};
