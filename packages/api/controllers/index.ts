import { Router } from "express";
import { health } from "./health";
import { fourOhFour } from "./404";
import { totp } from "./totp";
import { waitlist } from "./waitlist";
import { logout } from "./logout";
import { users } from "./users";
import { orgs } from "./orgs";
import { all } from "./all";

const API = Router();

API.use("/waitlist", waitlist);
API.use("/health", health);
API.use("/all", all);
API.use("/totp", totp);
API.use("/logout", logout);
API.use("/users", users);
API.use("/orgs", orgs);

// Catch All
API.use("*", fourOhFour);

export default API;
