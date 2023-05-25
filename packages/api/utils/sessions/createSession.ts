import type { Request, Response } from "express";
import { AllEntityNames, RelatedToType, Session } from "@plutomi/shared";
import { getCookieSettings, getCookieStore } from "../cookies";
import { generatePlutomiId } from "../generatePlutomiId";
import { env } from "../env";

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

  const clientIp =
    (req.headers["x-forwarded-for"][0] || req.socket.remoteAddress) ??
    "unknown";

  const newSession: Session = {
    _id: sessionId,
    createdAt: nowIso,
    updatedAt: nowIso,
    ip: clientIp,
    locationInfo: req.locationInfo,
    deviceInfo: req.deviceInfo,
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
