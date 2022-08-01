import { MongoClient, ServerApiVersion } from 'mongodb';


const client = new MongoClient(process.env.MONGO_CONNECTION, {
  keepAlive: true,
  serverApi: ServerApiVersion.v1,
});

const dbName = 'Plutomi';
const main = async () => {
  try {
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
