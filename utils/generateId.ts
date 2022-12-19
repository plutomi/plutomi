import ksuid from 'ksuid';

// TODO add interface here, generate entity prefix

const main = async () => {
  const ksuidFromAsync = await ksuid.random();

  const x = ksuidFromAsync;
  console.log(ksuidFromAsync.date);
  return ksuidFromAsync;
};

console.log(main());
