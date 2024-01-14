export const handler = async (event: any) => {
  console.log("EVENT PROCESSOR LAMBDA START");

  console.log(event);

  console.log("\n\n\n\n---------\n\n\n\n\n");

  console.log(JSON.stringify(event, null, 2));
  console.log("LAMBDA END");
};
