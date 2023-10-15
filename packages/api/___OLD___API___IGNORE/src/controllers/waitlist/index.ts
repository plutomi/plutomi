import { Router } from "express";
import { post } from "./post";

export const waitlist = Router();

waitlist.post("/", post);
