import type { RequestHandler } from "express";
import { createJoinedAggregation, getDbName } from "../../utils";
import { RelatedToType } from "@plutomi/shared";

export const get: RequestHandler = async (req, res) => {
  try {
    const x = await req.items
      .aggregate(
        createJoinedAggregation({
          id: "user_9510",
          entitiesToRetrieve: ["id", "notes", "files"],
          entitiesToRetrieveNames: ["user", "notes", "file"],
          rootItem: "user"
        })
      )
      .toArray();

    res.send(x[0]);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
  // try {
  //   const result = await req.client.db(getDbName()).command({ ping: 1 });
  //   res.status(200).json({
  //     message: "Saul Goodman",
  //     db: result
  //   });
  // } catch (error) {
  //   res.status(500).json({ message: "Error connecting to MongoDB!", error });
  // }
};
