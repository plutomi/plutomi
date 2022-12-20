import ksuid from 'ksuid';

// TODO nanoid alphabet '23456789abcdefghjklmnpqrstuvwxyz'

// TODO add interface here, generate entity prefix
// org for org
// appl for application
// stage for stage
// apcnt for applicant
//
// TODO
const main = async () => {
  const ksuidFromAsync = await ksuid.random();

  const x = ksuidFromAsync;
  console.log(ksuidFromAsync.date);
  return ksuidFromAsync;
};

console.log(main());
