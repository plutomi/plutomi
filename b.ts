import baseX from "base-x";
import { createHash } from "crypto";
import { customAlphabet } from "nanoid";

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const bs62 = baseX(BASE62);

const nanoid = customAlphabet(BASE62, 12);

const main = async () => {
  console.time("start");
  for (let i = 0; i < 1000000; i++) {
    const nowInMs = Date.now();
    const encodedDateOnly = bs62.encode(Buffer.from(nowInMs.toString()));
    const idPrefix = "user";
    const suffix = `${encodedDateOnly}${nanoid()}`;
    const id = `${idPrefix}_${suffix}`;

    console.log(
      id,
      `ID w/ Prefix: ${id.length}`,
      `ID Only: ${suffix.length}`,
      new Date(nowInMs)
    );
  }

  console.timeEnd("start");
};

const bugger = async () => {
  console.time("start");

  for (let i = 0; i < 1000000; i++) {
    const nowInMs = BigInt(Date.now());
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
