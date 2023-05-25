import { Router } from "express";
import { get } from "./get";
import { withSession } from "../../../middleware";

export const me = Router();

me.get("/", withSession, get);
