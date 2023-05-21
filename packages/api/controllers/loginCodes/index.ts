import { Router } from "express";
import { post } from "./post";

export const loginCodes = Router();


loginCodes.post("/", post)