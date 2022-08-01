import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose, { Model, Schema } from 'mongoose';
const { ObjectId } = Schema.Types;

require('dotenv').config({ path: '.env.local' });

const mongoURL = process.env.MONGO_CONNECTION;

const UserSchema = new Schema({
  _id: ObjectId,
  firstName: { type: String, default: 'FIRST_NAME' },
  lastName: { type: String, default: 'LAST_NAME' },
  email: {
    type: String,
    required: true,
  },
});

const UserModel = mongoose.model('User', UserSchema);

const client = new MongoClient(mongoURL, {
  keepAlive: true,
  serverApi: ServerApiVersion.v1,
});

const dbName = 'Plutomi';
const main = async () => {
  try {
    await mongoose.connect(mongoURL);

    const jose = new UserModel({ email: undefined });

    console.log('Attempting to connect...');
    await client.connect();
    console.log('Connected!');

    console.log('Creating DB');
    const db = client.db(dbName);

    console.log('DB created');

    const userCollection = db.collection('Users');

    console.log('Created users collection');

    console.log('Creating user');

    await userCollection.insertOne({ name: 'Jose', age: 24 });
    console.log('User created');

    const results = await userCollection.find().toArray();

    console.log('Results', results);

    await client.close();
  } catch (error) {
    console.error('Error connecting', error);
  }
};

main();
