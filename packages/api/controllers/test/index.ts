import { Router } from "express";
import { get } from "./get";
import { post } from "./post";

export const test = Router();

test.get("/get", get);
test.get("/post", post);
