import {
  SSMClient,
  GetParameterCommand,
  GetParameterCommandInput,
} from "@aws-sdk/client-ssm";
const ssm = new SSMClient({ region: "us-east-1" });

/**
 *
 * @param parameter_name - Name of the parameter to retrieve from parameter store
 */
export default async function GetParameter(parameter_name: string) {
  const SSM_PARAMS: GetParameterCommandInput = {
    Name: parameter_name,
  };
  try {
    const { Parameter } = await ssm.send(new GetParameterCommand(SSM_PARAMS));
    return Parameter?.Value;
  } catch (error) {
    const message = `Unable to retrieve parameter ${parameter_name} - ${error}`;
    throw new Error(message);
  }
}
