import { nanoid } from 'nanoid';

const UrlSafeString = require('url-safe-string');

interface TagGeneratorProps {
  value: string | number;
  joinString?: string;
}
export default function TagGenerator({ value, joinString }: TagGeneratorProps) {
  const generator = new UrlSafeString({ joinString });

  if (typeof value === 'number') {
    return generator.generate(nanoid(value));
  }
  return generator.generate(value);
}
