import { Router } from "express";
import { post } from "./post";

export const subscribe = Router();

subscribe.post("/", post);
