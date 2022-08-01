import mongoose from 'mongoose';
import { userSchema } from './entities/User';

require('dotenv').config({ path: '.env.development' });

const mongoURL = process.env.MONGO_CONNECTION;

const User = mongoose.model('User', userSchema);

const main = async () => {
  try {
    await mongoose.connect(mongoURL);

    const jose = new User({
      firstName: 'Jose',
      lastName: 'Valerio',
      email: 'joseyvalerio@gmail.com',
    });

    const me = await User.findById('62e7570ff6d02dffa6213021');
    // await jose.save();
    // const users = await User.find();

    me.firstName = 'Jose 2';
    await me.save();
    const users = await User.find();
    console.log('Updated me', users);
  } catch (error) {
    console.error('Error connecting', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

main();
