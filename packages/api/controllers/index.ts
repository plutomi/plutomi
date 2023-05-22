import { Router } from "express";
import { health } from "./health";
import { fourOhFour } from "./404";
import { totpCodes } from "./totpCodes";
import { waitList } from "./waitList";

const API = Router();

API.use("/waitList", waitList);
API.use("/health", health);
API.use("/totpCodes", totpCodes);

// Catch All
API.use("*", fourOhFour);

export default API;
