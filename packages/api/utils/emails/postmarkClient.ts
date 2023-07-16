import * as postmark from "postmark";
import { env } from "../env";

export const postmarkClient = new postmark.ServerClient(env.POSTMARK_API_KEY);
