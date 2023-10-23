import { Router } from "express";
import { get } from "./get";

export const health2 = Router();

health2.get("/", get);
