import ksuid from 'ksuid';

// TODO add interface here, generate entity prefix

const main = async () => {

  const ksuidFromAsync = await ksuid.random();

  return ksuidFromAsync;
};

console.log(main());
