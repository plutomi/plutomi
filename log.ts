type LogOptions = {
  data?: Record<string, string>;
  otherData: string;
};
const log = ({ ...rawOptions }: LogOptions) => {
  const options = { data: {}, ...rawOptions }; // Set default for data in case none was passed in

  console.log(`ALL OPTIONS: ${JSON.stringify(options, null, 2)}`);
};

// Data is missing, defaults to {} in your statement
log({ otherData: "test" });

log({ data: { iWillBe: "overWritten!" }, otherData: "test" });
