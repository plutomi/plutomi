import { Router } from "express";
import { health } from "./health";
import { fourOhFour } from "./404";
import { totp } from "./totp";
import { waitlist } from "./waitlist";

const API = Router();

API.use("/waitlist", waitlist);
API.use("/health", health);
API.use("/totp", totp);

// Catch All
API.use("*", fourOhFour);

export default API;
