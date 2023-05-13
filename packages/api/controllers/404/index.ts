import { Router } from "express";
import { all } from "./all";

export const fourOhFour = Router();

fourOhFour.use("/", all);
