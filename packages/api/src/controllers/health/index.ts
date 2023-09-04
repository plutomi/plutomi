import { Router } from "express";
import { get } from "./get";

export const health = Router();

health.get("/", get);
