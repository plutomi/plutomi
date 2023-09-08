import * as z from "zod";

export const awsRegionSchema = z
  .string()
  .regex(
    /^(us|af|ap|ca|cn|eu|me|sa)-(central|east|north|northeast|northwest|south|southeast|southwest|west)-\d$/
  );
