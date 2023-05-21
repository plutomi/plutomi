import { Router } from "express";
import { waitList } from "./waitlist";
import { health } from "./health";
import { fourOhFour } from "./404";
import { totpCodes } from "./totpCodes";

const API = Router();

API.use("/waitList", waitList);
API.use("/health", health);
API.use("/totpCodes", totpCodes);

// Catch All
API.use("*", fourOhFour);

export default API;
