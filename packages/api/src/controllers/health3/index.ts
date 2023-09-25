import { Router } from "express";
import { get } from "./get";

export const health3 = Router();

health3.get("/", get);
