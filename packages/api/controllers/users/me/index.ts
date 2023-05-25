import { Router } from "express";
import { get } from "./get";

export const me = Router();

me.get("/", get);
