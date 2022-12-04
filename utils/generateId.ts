import { v4, parse } from 'uuid';
const base62Alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const base62 = require('base-x')(base62Alphabet);

const main = () => {
  const buffer = Buffer.alloc(16);
  const id = v4(null, buffer);
  console.log('ID', id);
  const id3 = base62.encode(Buffer.from(id));
  return id3;
};

console.log(main());
