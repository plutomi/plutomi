import { Router } from "express";
import { subscribe } from "./subscribe";
import { health } from "./health";
import { fourOhFour } from "./404";

const API = Router();

API.use("/subscribe", subscribe);
API.use("/health", health);

// Catch All
API.use("*", fourOhFour);

export default API;
