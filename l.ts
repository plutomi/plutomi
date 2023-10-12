import axios from "axios";

const main = async () => {
  const responses = new Map();

  responses.set("598fc6db50c84bfc9c74be3e9d98cbdd", 0);
  responses.set("598fc6db50c84bfc9c74be3e9d98cbdd-times", []);

  responses.set("738701927d894bb29ec012e1f884b079", 0);
  responses.set("738701927d894bb29ec012e1f884b079-times", []);

  for (let i = 0; i < 1000; i++) {
    const startTime = Date.now();
    const res = await axios.get(
      `https://plutomi-load-balancer-775549393.us-east-1.elb.amazonaws.com/api/health`
    );

    const endTime = Date.now();
    const time = endTime - startTime;
    const id = res.data.identifier;
    console.log(id);
    responses.set(id, responses.get(id) + 1);
    responses.get(`${id}-times`).push(time);

    if ((i + 1) % 100 === 0) {
      console.log(`Completed ${i + 1} requests. Tally:\n`);
    }
  }

  console.log(responses.get("598fc6db50c84bfc9c74be3e9d98cbdd"));
  console.log(responses.get("738701927d894bb29ec012e1f884b079"));

  console.log(`All stats:\n`);
  console.log(`598fc6db50c84bfc9c74be3e9d98cbdd`);
  console.log(
    `Min: ${Math.min(
      ...responses.get("598fc6db50c84bfc9c74be3e9d98cbdd-times")
    )}`
  );
  console.log(
    `Max: ${Math.max(
      ...responses.get("598fc6db50c84bfc9c74be3e9d98cbdd-times")
    )}`
  );
  console.log(
    `Avg: ${
      responses
        .get("598fc6db50c84bfc9c74be3e9d98cbdd-times")
        .reduce((a, b) => a + b, 0) /
      responses.get("598fc6db50c84bfc9c74be3e9d98cbdd-times").length
    }`
  );
  console.log(`738701927d894bb29ec012e1f884b079`);
  console.log(
    `Min: ${Math.min(
      ...responses.get("738701927d894bb29ec012e1f884b079-times")
    )}`
  );
  console.log(
    `Max: ${Math.max(
      ...responses.get("738701927d894bb29ec012e1f884b079-times")
    )}`
  );
  console.log(
    `Avg: ${
      responses
        .get("738701927d894bb29ec012e1f884b079-times")
        .reduce((a, b) => a + b, 0) /
      responses.get("738701927d894bb29ec012e1f884b079-times").length
    }`
  );
};

main();
