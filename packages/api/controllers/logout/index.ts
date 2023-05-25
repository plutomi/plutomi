import { Router } from "express";
import { get } from "./get";

export const logout = Router();

logout.get("/", get);
