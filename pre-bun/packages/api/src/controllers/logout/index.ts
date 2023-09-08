import { Router } from "express";
import { get } from "./get";
import { withSession } from "../../middleware";

export const logout = Router();

logout.get("/", withSession, get);
