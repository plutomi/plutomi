import { Router } from "express";
import { post } from "./post";
import { verify } from "./verify";
import { u } from "./u";

export const totp = Router();

totp.use("/verify", verify);

totp.post("/", post);
totp.get("/", u);
