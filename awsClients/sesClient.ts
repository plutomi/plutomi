import { SESClient } from "@aws-sdk/client-ses";

const SESclient = new SESClient({ region: "us-east-1" });

export default SESclient;
