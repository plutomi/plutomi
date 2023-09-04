import { Router } from "express";
import { post } from "./post";

const verify = Router();

verify.post("/", post);

export { verify };
