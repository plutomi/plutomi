import { Router } from "express";
import { post } from "./post";

export const waitList = Router();

waitList.post("/", post);
