import baseX from "base-x";
import { createHash } from "crypto";
import { customAlphabet } from "nanoid";

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const bs62 = baseX(BASE62);

const nanoid = customAlphabet(BASE62, 12);

const bugger = async () => {
  console.time("start");

  for (let i = 0; i < 1000000; i++) {
    const now = Date.now();
    const nowInMs = BigInt(now);
    const idPrefix = "user";
    const randomData = nanoid();

    const timeBuffer = Buffer.alloc(8); // allocate 8 bytes for BigInt
    timeBuffer.writeBigInt64BE(nowInMs, 0); // 64bit timestamp

    const encodedDateOnly = bs62.encode(timeBuffer);

    const suffix = `${encodedDateOnly}${randomData}`;

    const id = `${idPrefix}_${suffix}`;

    console.log(id, id.length, new Date(Number(nowInMs)));
  }

  console.timeEnd("start");
};
bugger();
