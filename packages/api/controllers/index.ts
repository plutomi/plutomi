import { Router } from "express";
import { subscribe } from "./subscribe";

const API = Router();

API.use("/subscribe", subscribe);

export default API;
