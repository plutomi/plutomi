import { EventBridgeClient } from "@aws-sdk/client-eventbridge";

const config = { region: "us-east-1" };
const EBClient = new EventBridgeClient(config);

export default EBClient;
