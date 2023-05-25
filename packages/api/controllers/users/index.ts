import { Router } from "express";
import { me } from "./me";

export const users = Router();

users.use("/me", me);
