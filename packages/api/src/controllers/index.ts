import { Router } from "express";
import { health } from "./health";
import { health2 } from "./health2";
import { health3 } from "./health3";

import { fourOhFour } from "./404";
import { totp } from "./totp";
import { waitlist } from "./waitlist";
import { logout } from "./logout";
import { users } from "./users";
import { orgs } from "./orgs";

const API = Router();

API.use("/waitlist", waitlist);
API.use("/health", health);
API.use("/health2", health2);
API.use("/health3", health3);
API.use("/totp", totp);
API.use("/logout", logout);
API.use("/users", users);
API.use("/orgs", orgs);

// Catch All
API.use("*", fourOhFour);

export default API;
