import { collections, connectToDatabase } from './utils/connectToDatabase';
import { mongoClient } from './utils/connectToDatabase';
import { randomNumberInclusive } from './utils/randomNumberInclusive';
import { faker } from '@faker-js/faker';

const main = async () => {
  try {
    await connectToDatabase();
    console.log('Connected!');
  } catch (error) {
    console.error(`error `, error);
  }
  const orgs = [
    {
      name: 'GrubHub',
      weight: 0.18,
    },
    {
      name: 'GoPuff',
      weight: 0.32,
    },
    {
      name: 'JustEat',
      weight: 0.44,
    },
    {
      name: 'Deliveroo',
      weight: 0.54,
    },
    {
      name: 'Chipotle',
      weight: 0.62,
    },

    {
      name: 'Fetch',
      weight: 0.71,
    },

    {
      name: 'WeWork',
      weight: 0.78,
    },

    {
      name: 'Chick Fil A',
      weight: 0.84,
    },
    {
      name: 'Gorillas',
      weight: 0.89,
    },

    {
      name: 'Laundry Heap',
      weight: 0.93,
    },
    {
      name: 'SweetGreen',
      weight: 0.97,
    },
    {
      name: 'MasterCard',
      weight: 1,
    },
  ];

  const openings = [
    {
      name: 'NYC',
      weight: 0.37,
    },
    {
      name: 'Miami',
      weight: 0.18,
    },
    {
      name: 'Chicago',
      weight: 0.24,
    },
    {
      name: 'Los Angeles',
      weight: 0.21,
    },
  ];

  const stages = [
    {
      name: 'Questionnaire',
      weight: 0.17,
    },
    {
      name: 'Interviewing',
      weight: 0.25,
    },
    {
      name: 'Rejected',
      weight: 0.49,
    },
    {
      name: 'Hired',
      weight: 0.09,
    },
  ];

  let applicantsToCreate: any = [];
  const numberOfBatches = 100;
  const applicantsPerBatch = 5000;
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

  //   for (let i = 0; i < numberOfBatches; i++) {
  //     console.log('Starting');
  //     await collections.applicants?.deleteMany({});
  //     console.log('End');
  //   }
  for (let i = 0; i < numberOfBatches; i++) {
    const localBatch: any = [];

    for (let i = 0; i < applicantsPerBatch; i++) {
      const getOrg = () => {
        const num = Math.random();

        for (const org of orgs) {
          if (num < org.weight) {
            return org.name;
          }
        }
      };

      const getOpening = () => {
        const num = Math.random();

        for (const opening of openings) {
          if (num < opening.weight) {
            return opening.name;
          }
        }
      };

      const getStage = () => {
        const num = Math.random();

        for (const stage of stages) {
          if (num < stage.weight) {
            return stage.name;
          }
        }
      };
      const orgForApplicant = getOrg();
      const openingForApplicant = getOpening();
      const stageForApplicant = getStage();

      const app = {
        guid: faker.database.mongodbObjectId(),
        isActive: Math.random() > 0.5,
        balance: faker.commerce.price(10, 5000),
        picture: 'http://placehold.it/32x32',
        age: randomNumberInclusive(10, 99),
        eyeColor: faker.commerce.color(),
        name: faker.name.findName(),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        company: orgForApplicant,
        email: faker.internet.email(),
        phone: faker.phone.phoneNumber(),
        address: faker.address.streetAddress(),
        about: faker.lorem.sentences(randomNumberInclusive(3, 100)),
        latitude: randomNumberInclusive(-100, 100),
        longitude: randomNumberInclusive(-100, 100),
        desc: faker.commerce.productDescription(),
        tags: [
          'consectetur in esse consequat sunt labore amet consectetur',
          'adipisicing dolor fugiat do sint do proident ullamco',
          'nostrud aliquip cillum pariatur nisi exercitation velit dolor',
          'qui laborum cillum mollit ut duis non esse',
          'anim eu tempor enim excepteur laboris occaecat enim',
          'voluptate et esse do incididunt est irure velit',
          'anim deserunt dolor non veniam nulla labore veniam',
          'magna enim qui ut excepteur commodo veniam ex',
          'minim occaecat eiusmod quis eiusmod non sint consequat',
          'non reprehenderit dolore pariatur aliqua qui esse mollit',
          'tempor in quis pariatur laborum nulla fugiat voluptate',
          'incididunt nulla dolore nulla cillum fugiat sint aliqua',
          'est ad sint irure sit mollit aliqua anim',
          'amet ad ad dolor aliqua sunt aliqua ut',
          'irure sit do non et proident id in',
          'ea occaecat sunt qui aute commodo elit irure',
          'cupidatat ullamco sit sit elit do ex laborum',
          'minim magna consequat Lorem aliquip voluptate dolore adipisicing',
          'ut eiusmod ipsum id dolor minim laboris elit',
          'occaecat aute ipsum eiusmod magna tempor elit ut',
        ],
        friends: [
          {
            id: 0,
            name: 'Riddle Stephenson',
          },
          {
            id: 1,
            name: 'Howard Morales',
          },
          {
            id: 2,
            name: 'Dorthy Lowery',
          },
          {
            id: 3,
            name: 'Best Barber',
          },
          {
            id: 4,
            name: 'Buchanan Montoya',
          },
          {
            id: 5,
            name: 'Gilliam Sharp',
          },
          {
            id: 6,
            name: 'Colon Humphrey',
          },
          {
            id: 7,
            name: 'Laverne Hardin',
          },
          {
            id: 8,
            name: 'Woodard Lowe',
          },
          {
            id: 9,
            name: 'Fleming Sims',
          },
        ],
        greeting: 'Hello, Nadia Santos! You have 10 unread messages.',
        favoriteDbType: faker.database.type(),
      };

      const newApplicant = {
        ...app,
        idx: i,
        org: orgForApplicant,
        target: [
          { property: 'Org', value: orgForApplicant },
          { property: 'Opening', value: openingForApplicant },
          { property: 'Stage', value: stageForApplicant },
        ],
      };
      localBatch.push(newApplicant);
    }
    applicantsToCreate.push(localBatch);
  }
  console.log('Sending to mongo');
  await sendToMongo();
};

main();