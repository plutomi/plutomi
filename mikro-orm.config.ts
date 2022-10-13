import { Options } from '@mikro-orm/core';
import { MongoHighlighter } from '@mikro-orm/mongo-highlighter';
import { MongoDriver } from '@mikro-orm/mongodb';
import { Org } from './entities/Org';
import { User } from './entities/User';
import { UserLoginLink } from './entities/UserLoginLink';

const mikroOrmOptions: Options<MongoDriver> = {
  type: 'mongo',
  entities: [User, Org, UserLoginLink],
  dbName: 'staging', // TODO get from .env
  highlighter: new MongoHighlighter(),
  debug: true,
  ensureIndexes: true,
  clientUrl:
    'mongodb+srv://IupGDoGWC2J24qK0RWYi0X5Tzqk9qqc1sLXc:ywSUZLI1wmevGTCf8cjZXuu2tgnVnOHSx79V7MmW6icoVeeTrE@staging.pd4tt.mongodb.net/?retryWrites=true&w=majority',
};

export default mikroOrmOptions;
