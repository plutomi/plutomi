import { parseEnv } from "@plutomi/env";
import { SchemaEnvironment } from "@plutomi/env/consts/SchemaEnvironment";

export const env = parseEnv({
  schemaEnvironment: SchemaEnvironment.API
});
