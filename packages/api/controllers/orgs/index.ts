import { Router } from "express";
import { post } from "./post";

export const orgs = Router();

orgs.post("/", post);
