import { IdPrefix } from "@plutomi/shared";
import { Request, RequestHandler, Response } from "express";

export const u: RequestHandler = async (req, res) => {
  console.log("StaRting");

  try {
    const x = await req.items.findOne({
      email: "joseyvalerio@gmail.com",
      _type: "user"
    });

    if (x === null) {
      console.log("Item not found!");
    } else {
      console.log("Item found 1!");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error ocurred logging you in"
    });
    return;
  }

  try {
    console.time("Update Timer");
    const x = await req.items.findOneAndUpdate(
      {
        email: "joseyvalerio@gmail.com",
        _type: IdPrefix.USER
      },
      {
        $set: {
          test: "new_item"
        }
      }
    );

    console.timeEnd("Update Timer");
    if (x.value === null) {
      console.log("Item not found FOR UPDATE!");
    } else {
      console.log("Item found for update!!");
    }

    console.log(x.value);
    res.status(200).json({
      message: "Done updating!"
    });

    console.log("Done updating!");
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error ocurred logging you in"
    });
  }
};
