import { init } from "@paralleldrive/cuid2";
import baseX from "base-x";

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const bs62 = baseX(BASE62);

const createId = init({
  length: 6
});

const dupeChecker = new Map();

const main = async () => {
  console.time("start");
  let dupeCount = 0;
  for (let i = 0; i < 1000; i++) {
    const nowInMs = new Date().getTime();
    const before = `${nowInMs}${createId()}`;
    const hashed = bs62.encode(Buffer.from(before));
    const idPrefix = "api_key";
    const id = `${idPrefix}_${hashed}`;
    if (dupeChecker.has(id)) {
      dupeCount++;
    }
    dupeChecker.set(id, true);
    console.log(id, id.length, hashed.length, nowInMs, new Date(nowInMs));
    // await timer(randomDelay);
    // console.timeEnd("iteration");
  }
  console.log(dupeChecker.size);
  console.log(dupeCount);
  console.log(
    `${((dupeCount / dupeChecker.size) * 100).toFixed(2)}% were duplicates.`
  );
  console.timeEnd("start");
};

main();
