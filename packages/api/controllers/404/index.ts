import { Router } from "express";
import { all } from "./all";

export const FourOhFour = Router();

FourOhFour.use("/", all);
