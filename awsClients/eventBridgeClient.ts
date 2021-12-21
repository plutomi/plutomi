import { EventBridgeClient } from "@aws-sdk/client-eventbridge";

const EBClient = new EventBridgeClient({ region: "us-east-1" });

export default EBClient;
