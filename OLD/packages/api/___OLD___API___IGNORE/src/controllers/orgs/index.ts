import { Router } from "express";
import { post } from "./post";
import { withSession } from "../../middleware";

export const orgs = Router();

orgs.post("/", withSession, post);
