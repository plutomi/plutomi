import {
  type Workspace,
  type Org,
  type Membership,
  IdPrefix,
  RelatedToType,
  WorkspaceRole,
  OrgRole
} from "@plutomi/shared";
import { Schema, validate } from "@plutomi/validation";
import type { RequestHandler, Request, Response } from "express";
import { generatePlutomiId } from "../../utils";

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
  const { name, publicOrgId } = data;






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
      errorMessage = "An org with that id already exists, please choose another.";
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
