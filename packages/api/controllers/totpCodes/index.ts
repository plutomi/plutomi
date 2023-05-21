import { Router } from "express";
import { post } from "./post";

export const totpCodes = Router();

totpCodes.post("/", post);
