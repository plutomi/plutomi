import { Request, Response } from "express";
import * as Users from "../models/Users/index";
import * as Applicants from "../models/Applicants/index";
import errorFormatter from "../utils/errorFormatter";
import { unsealData } from "iron-session";
import { ENTITY_TYPES } from "../Config";
import * as Time from "../utils/time";
export const unsubscribe = async (req: Request, res: Response) => {
  const { hash } = req.params;

  if (!hash) {
    return res.status(400).json({ message: "Invalid link" });
  }

  // ids && entityType will be undefined if the hash is wrong
  let data;
  try {
    data = await unsealData(hash, {
      password: process.env.IRON_SEAL_PASSWORD,
      ttl: 0,
    });
  } catch (error) {
    return res.status(400).json({ message: "Invalid link" });
  }

  if (data.entityType === ENTITY_TYPES.USER) {
    if (!data.userId) {
      return res.status(400).json({ message: "Invalid link" });
    }
    // Check if the user even exists
    const [user, error] = await Users.getUserById({
      userId: data.userId as string, // TODO add type to data above
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid link" });
    }

    if (error) {
      const formattedError = errorFormatter(error);
      return res.status(formattedError.httpStatusCode).json({
        message: "An error ocurred retrieving user info",
        ...formattedError,
      });
    }

    if (!user.canReceiveEmails) {
      return res.status(200).json({
        message:
          "You've already unsubscribed! Please reach out to support@plutomi.com to opt back in to emails",
      });
    }

    const [unsubbed, failed] = await Users.updateUser({
      userId: user.userId,
      ALLOW_FORBIDDEN_KEYS: true,
      newUserValues: {
        canReceiveEmails: false,
        unsubscribedAt: Time.currentISO(),
      },
    });

    if (failed) {
      const formattedError = errorFormatter(failed);
      return res.status(formattedError.httpStatusCode).json({
        message: "An error ocurred while unsubscribing",
        ...formattedError,
      });
    }
  } else {
    /**
     * Unsubscribe applicants // TODO possibly other entities?
     */
    if (!data.applicantId) {
      return res.status(400).json({ message: "Invalid link" });
    }
    // Check if the applicant even exists
    const [applicant, error] = await Applicants.getApplicantById({
      applicantId: data.applicantId as string, // TODO add type to data above
    });

    if (!applicant) {
      return res.status(400).json({ message: "Invalid link" });
    }

    if (error) {
      const formattedError = errorFormatter(error);
      return res.status(formattedError.httpStatusCode).json({
        message: "An error ocurred retrieving applicant info",
        ...formattedError,
      });
    }

    if (!applicant.canReceiveEmails) {
      return res.status(200).json({
        message:
          "You've already unsubscribed! Please reach out to support@plutomi.com to opt back in to emails",
      });
    }

    const [unsubbed, failed] = await Applicants.updateApplicant({
      applicantId: applicant.applicantId,
      orgId: applicant.orgId,
      newApplicantValues: {
        canReceiveEmails: false,
        unsubscribedAt: Time.currentISO(),
      },
    });

    if (failed) {
      const formattedError = errorFormatter(failed);
      return res.status(formattedError.httpStatusCode).json({
        message: "An error ocurred while unsubscribing",
        ...formattedError,
      });
    }
  }

  return res.status(200).json({ message: "Unsubscribed!" });
};
