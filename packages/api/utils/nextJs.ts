import next from "next";
import path from "path";
import { env } from "./env";

const dev = env.NODE_ENV !== "production";

const dir = path.join(__dirname, "../../web");
export const webApp = next({ dev, dir });

export const nextHandler = webApp.getRequestHandler();
