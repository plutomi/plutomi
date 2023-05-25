import type { Request, Response } from "express";
import {
  AllEntityNames,
  type PlutomiId,
  RelatedToType,
  type Session
} from "@plutomi/shared";
import dayjs from "dayjs";
import { getCookieSettings, getCookieStore } from "../cookies";
import { generatePlutomiId } from "../generatePlutomiId";
import { env } from "../env";
import { COOKIE_MAX_AGE_IN_MS } from "../../consts";

type CreateSessionProps = {
  req: Request;
  res: Response;
  userId: PlutomiId<AllEntityNames.USER>;
};

export const createSession = async ({
  req,
  res,
  userId
}: CreateSessionProps) => {
  const cookieStore = getCookieStore({ req, res });
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
      .add(COOKIE_MAX_AGE_IN_MS, "milliseconds")
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

  cookieStore.set(
    `${env.DEPLOYMENT_ENVIRONMENT}-plutomi-cookie`,
    sessionId,
    getCookieSettings()
  );
};
