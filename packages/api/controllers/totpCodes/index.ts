import { Router } from "express";
import { post } from "./post";
import { validate } from "./validate";

export const totpCodes = Router();

totpCodes.use("/validate", validate);

totpCodes.post("/", post);
