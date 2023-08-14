import { Router } from "express";
import { get } from "./get";
import { cleanup } from "./delete";

export const health = Router();

health.get("/", get);
health.get("/delete", cleanup);
