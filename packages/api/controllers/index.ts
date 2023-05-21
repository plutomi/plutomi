import { Router } from "express";
import { subscribe } from "./subscribe";
import { health } from "./health";
import { fourOhFour } from "./404";
import { totpCodes } from "./totpCodes";

const API = Router();

API.use("/subscribe", subscribe);
API.use("/health", health);
API.use("/totpCodes", totpCodes);

// Catch All
API.use("*", fourOhFour);

export default API;
