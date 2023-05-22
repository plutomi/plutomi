import { Router } from "express";
import { post } from "./post";
import { verify } from "./verify";

export const totpCodes = Router();

totpCodes.use("/verify", verify);

totpCodes.post("/", post);
