import { Router } from "express";
import { health } from "./health";
import { fourOhFour } from "./404";
import { totp } from "./totp";
import { waitlist } from "./waitlist";
import { logout } from "./logout";

const API = Router();

API.use("/waitlist", waitlist);
API.use("/health", health);
API.use("/totp", totp);
API.use("/logout", logout);

// Catch All
API.use("*", fourOhFour);

export default API;
