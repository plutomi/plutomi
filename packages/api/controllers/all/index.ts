import { Router } from "express";
import { get } from "./get";

export const all = Router();

all.use("/", get);
