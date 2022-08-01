import mongoose from 'mongoose';
import { User } from './entities/User';

require('dotenv').config({ path: '.env.development' }); // TODO

const mongoURL = process.env.MONGO_CONNECTION;

const main = async () => {
  try {
    await mongoose.connect(mongoURL, {
      dbName: 'Plutomi',
    });

    // await mongoose.connection.db.listCollections().toArray();
    const jose = new User({
      firstName: 'Jose 1',
      lastName: 'Valerio',
      email: 'joseyvalerio@gmail.com',
    });

    // const me = await User.findById('62e7570ff6d02dffa6213021');
    await jose.save();
    const users = await User.find();

    // me.firstName = 'Jose 2';
    // await jose.save();
    // const users = await User.find();
    console.log('UISERS', users);
  } catch (error) {
    console.error('Error connecting', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

main();
