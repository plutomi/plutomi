import { Router } from "express";
import { post } from "./post";
import { verify } from "./verify";

export const totp = Router();

totp.use("/verify", verify);

totp.post("/", post);
