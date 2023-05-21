import { Router } from "express";
import { post } from "./post";

const validate = Router();

validate.post("/", post);

export { validate };
