import { Options } from '@mikro-orm/core';
import { MongoHighlighter } from '@mikro-orm/mongo-highlighter';
import { Author, Book, BookTag, Publisher, BaseEntity } from './entities';

const options: Options = {
  type: 'mongo',
  entities: [Author, Book, BookTag, Publisher, BaseEntity],
  dbName: 'mikro-orm-express-ts',
  highlighter: new MongoHighlighter(),
  debug: true,
};

export default options;
