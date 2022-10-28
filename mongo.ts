import { collections, connectToDatabase } from './utils/connectToDatabase';
import { mongoClient } from './utils/connectToDatabase';
import { randomNumberInclusive } from './utils/randomNumberInclusive';
const app = {
  isActive: false,
  balance: '$3,171.95',
  picture: 'http://placehold.it/32x32',
  age: 40,
  eyeColor: 'blue',
  name: 'Robyn Malone',
  gender: 'female',
  company: 'ENAUT',
  email: 'robynmalone@enaut.com',
  phone: '+1 (859) 401-3406',
  address: '600 Remsen Street, Como, Idaho, 6450',
  about:
    'Dolore aliqua fugiat ut excepteur ipsum ut reprehenderit consectetur id aute minim quis adipisicing. Lorem adipisicing anim officia ipsum id fugiat exercitation aliquip sunt. Dolor anim veniam ea exercitation nulla dolor magna ea commodo magna. Ad eiusmod eu reprehenderit consectetur. Ipsum id adipisicing duis Lorem velit nulla aliqua deserunt Lorem est ea nostrud nisi pariatur.\r\nSit tempor enim proident magna nisi reprehenderit eiusmod minim aliquip sit exercitation dolore nisi labore. Lorem reprehenderit et fugiat eiusmod consectetur aute aliqua in anim. Sint Lorem magna cupidatat culpa dolor cupidatat aliqua. Eu duis aliquip amet laborum pariatur laborum culpa labore ad velit magna. Velit qui veniam qui officia ullamco amet.\r\nQuis irure labore commodo sunt. Ea commodo voluptate consequat proident consequat cillum ut commodo deserunt dolore Lorem. Deserunt ad laborum duis dolor consequat occaecat exercitation enim consequat laborum duis consectetur adipisicing. Dolor excepteur id et velit tempor aute esse cillum nulla aliqua ea voluptate. Pariatur elit ipsum id tempor eiusmod mollit ut qui ad sunt dolore adipisicing. Incididunt exercitation incididunt duis officia commodo amet esse aliqua cillum reprehenderit eiusmod quis. Ullamco laborum amet irure commodo nisi duis amet commodo velit aliquip.\r\nIrure non qui sint laborum sint elit sint mollit voluptate nostrud non. Nisi laborum ea irure ut nulla qui. Exercitation Lorem cupidatat eu non deserunt elit dolor officia occaecat tempor amet. Incididunt est reprehenderit mollit cupidatat exercitation incididunt irure voluptate eiusmod. Labore ipsum eiusmod non ullamco mollit. Adipisicing pariatur veniam velit nostrud consequat nulla consectetur consectetur proident.\r\nVoluptate Lorem cillum anim duis nulla. Quis ipsum fugiat proident esse do officia minim. Ipsum sint fugiat consequat et ipsum exercitation ea in labore tempor occaecat et. Labore commodo do sint dolor occaecat anim fugiat est laborum est excepteur cupidatat ipsum. Veniam velit consequat duis velit est culpa qui adipisicing dolore aliquip. Do minim Lorem incididunt aute cupidatat. Aliquip labore aliqua magna nisi non ad cillum officia elit dolore mollit nulla exercitation mollit.\r\n',
  registered: '2022-01-05T07:55:52 +05:00',
  latitude: -30.363957,
  longitude: 143.167492,
  tags: [
    'sunt mollit laborum irure fugiat enim qui tempor',
    'ea commodo nostrud ex velit tempor nulla tempor',
    'occaecat officia anim velit proident magna sunt ipsum',
    'labore labore culpa labore aute commodo aliqua proident',
    'do enim minim ullamco quis enim id ex',
    'dolore elit non irure ad sunt dolore non',
    'excepteur enim irure veniam consequat id esse laborum',
    'commodo qui deserunt eu nisi consectetur incididunt consectetur',
    'eiusmod dolore nulla mollit occaecat anim fugiat aliqua',
    'magna duis non qui id adipisicing voluptate magna',
    'labore Lorem excepteur Lorem cillum proident quis dolore',
    'laboris sit do culpa culpa ullamco dolor quis',
    'dolor occaecat duis qui qui labore dolor tempor',
    'ex mollit id irure non sunt sint esse',
    'aliqua nostrud culpa minim ut pariatur irure laborum',
    'culpa aliquip quis dolor magna aliqua est aute',
    'laboris qui occaecat laborum cillum cupidatat elit duis',
    'aute dolor ipsum esse exercitation ad officia aliqua',
    'qui nulla excepteur ullamco aliqua aliquip irure velit',
    'fugiat quis occaecat laborum aute qui est officia',
  ],
  friends: [
    {
      id: 0,
      name: 'Shawna Warner',
    },
    {
      id: 1,
      name: 'Maxwell Benjamin',
    },
    {
      id: 2,
      name: 'Watson Slater',
    },
    {
      id: 3,
      name: 'Marianne Wood',
    },
    {
      id: 4,
      name: 'Denise Lawrence',
    },
    {
      id: 5,
      name: 'Delaney Patrick',
    },
    {
      id: 6,
      name: 'Fuentes Aguirre',
    },
    {
      id: 7,
      name: 'Wendi Whitehead',
    },
    {
      id: 8,
      name: 'Holt Ward',
    },
    {
      id: 9,
      name: 'Fox Hubbard',
    },
  ],
  greeting: 'Hello, Robyn Malone! You have 6 unread messages.',
  favoriteFruit: 'strawberry',
};
const main = async () => {
  try {
    await connectToDatabase();
    console.log('Connected!');
  } catch (error) {
    console.error(`error `, error);
  }

  const orgs = [1, 2, 3];

  let applicantsToCreate: any = [];
  const numberOfBatches = 100;
  const applicantsPerBatch = 10000;
  let processedApplicants = 0;
  const sendToMongo = async () => {
    for await (const batch of applicantsToCreate) {
      const bidx = applicantsToCreate.indexOf(batch) + 1;
      await collections.applicants?.insertMany(batch);
      processedApplicants += batch.length;
      console.log(
        `Done processing batch`,
        bidx,
        ` - ${batch.length} applicants - Total: ${processedApplicants} / ${
          numberOfBatches * applicantsPerBatch
        }`,
      );
    }
    console.log('Inserted all batches!');
  };

  for (let i = 0; i < numberOfBatches; i++) {
    const localBatch: any = [];

    for (let i = 0; i < applicantsPerBatch; i++) {
      const randomOrg = orgs[randomNumberInclusive(0, orgs.length - 1)];
      const newApplicant = {
        ...app,
        idx: i,
        org: randomOrg,
        target: [{ property: 'Org', value: randomOrg }],
      };
      localBatch.push(newApplicant);
    }
    applicantsToCreate.push(localBatch);
  }
  console.log('Sending to mongo');
  await sendToMongo();
};

main();
