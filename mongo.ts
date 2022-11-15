import { collections, connectToDatabase, mongoClient } from './utils/connectToDatabase';
import { randomNumberInclusive } from './utils/randomNumberInclusive';
import { faker } from '@faker-js/faker';
import { nanoid } from 'nanoid';
import { OrgEntity, StageEntity, UserEntity } from './models';
import { IndexableProperties } from './@types/indexableProperties';
import dayjs from 'dayjs';
import { UpdateFilter } from 'mongodb';
import { OpeningEntity } from './models/Opening';
const increment = [];
const decrement = [];

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
      weight: 0.24,
    },
    {
      name: 'Miami',
      weight: 0.42,
    },
    {
      name: 'Chicago',
      weight: 0.69,
    },
    {
      name: 'Los Angeles',
      weight: 0.84,
    },
    {
      name: 'Toronto',
      weight: 0.92,
    },
    {
      name: 'Seattle',
      weight: 1,
    },
  ];

  const stages = [
    {
      name: 'Questionnaire',
      weight: 0.17,
    },
    {
      name: 'Interviewing',
      weight: 0.42,
    },
    {
      name: 'Rejected',
      weight: 0.95,
    },
    {
      name: 'Hired',
      weight: 1,
    },
  ];

  let applicantsToCreate: any = [];
  const numberOfBatches = 1;
  const applicantsPerBatch = 5000;
  let processedApplicants = 0;
  const sendToMongo = async () => {
    const t = await collections.orgs
      .aggregate([
        {
          $match: {
            target: {
              property: 'Org',
              value: '1',
            },
          },
        },
        {
          $unwind: {
            path: '$target',
          },
        },
        {
          $match: {
            'target.property': 'User',
          },
        },
        {
          $group: {
            _id: '$target.value',
          },
        },
        {
          $lookup: {
            from: 'Users',
            localField: '_id',
            foreignField: 'id',
            as: 'user',
          },
        },
        {
          $addFields: {
            user: {
              $arrayElemAt: ['$user', 0],
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: '$user',
          },
        },
        {
          $unset: '_id',
        },
      ])
      .toArray();

    console.log(`RES`);
    console.log(t);
    // for await (const batch of applicantsToCreate) {
    //   const bidx = applicantsToCreate.indexOf(batch) + 1;
    //   await collections.questions?.insertMany(batch);
    //   processedApplicants += batch.length;
    //   console.log(
    //     `Done processing batch`,
    //     bidx,
    //     ` - ${batch.length} applicants - Total: ${processedApplicants} / ${
    //       numberOfBatches * applicantsPerBatch
    //     }`,
    //   );
    // }
  };

  // for (let i = 0; i < numberOfBatches; i++) {
  //   console.log('Starting');
  //   await collections.applicants?.deleteMany({});
  //   console.log('End');
  // }

  // for (let i = 0; i < numberOfBatches; i++) {
  //   const localBatch: any = [];

  //   for (let i = 0; i < applicantsPerBatch; i++) {
  //     const getOrg = () => {
  //       const num = Math.random();

  //       for (const org of orgs) {
  //         if (num < org.weight) {
  //           return org.name;
  //         }
  //       }
  //     };

  //     const orgForApplicant = getOrg();

  //     const getOpening = () => {
  //       const num = Math.random();

  //       for (const opening of openings) {
  //         if (num < opening.weight) {
  //           return `${opening.name}-${orgForApplicant}`;
  //         }
  //       }
  //     };
  //     const openingForApplicant = getOpening();

  //     const getStage = () => {
  //       const num = Math.random();

  //       for (const stage of stages) {
  //         if (num < stage.weight) {
  //           return `${stage.name}-${openingForApplicant}-${orgForApplicant}`;
  //         }
  //       }
  //     };
  //     const stageForApplicant = getStage();
  //     const applicantId = nanoid(100);
  //     const app = {
  //       guid: faker.database.mongodbObjectId(),
  //       isActive: Math.random() > 0.5,
  //       balance: Math.random() * randomNumberInclusive(1, 10000),
  //       picture: 'http://placehold.it/32x32',
  //       age: randomNumberInclusive(10, 99),
  //       eyeColor: faker.commerce.color(),
  //       name: faker.name.findName(),
  //       gender: Math.random() > 0.5 ? 'male' : 'female',
  //       company: orgForApplicant,
  //       email: faker.internet.email(),
  //       phone: faker.phone.phoneNumber(),
  //       address: faker.address.streetAddress(),
  //       about: faker.lorem.sentences(randomNumberInclusive(3, 100)),
  //       latitude: randomNumberInclusive(-100, 100),
  //       longitude: randomNumberInclusive(-100, 100),
  //       desc: faker.commerce.productDescription(),
  //       id: nanoid(100),
  //       tags: [
  //         'consectetur in esse consequat sunt labore amet consectetur',
  //         'adipisicing dolor fugiat do sint do proident ullamco',
  //         'nostrud aliquip cillum pariatur nisi exercitation velit dolor',
  //         'qui laborum cillum mollit ut duis non esse',
  //         'anim eu tempor enim excepteur laboris occaecat enim',
  //         'voluptate et esse do incididunt est irure velit',
  //         'anim deserunt dolor non veniam nulla labore veniam',
  //         'magna enim qui ut excepteur commodo veniam ex',
  //         'minim occaecat eiusmod quis eiusmod non sint consequat',
  //         'non reprehenderit dolore pariatur aliqua qui esse mollit',
  //         'tempor in quis pariatur laborum nulla fugiat voluptate',
  //         'incididunt nulla dolore nulla cillum fugiat sint aliqua',
  //         'est ad sint irure sit mollit aliqua anim',
  //         'amet ad ad dolor aliqua sunt aliqua ut',
  //         'irure sit do non et proident id in',
  //         'ea occaecat sunt qui aute commodo elit irure',
  //         'cupidatat ullamco sit sit elit do ex laborum',
  //         'minim magna consequat Lorem aliquip voluptate dolore adipisicing',
  //         'ut eiusmod ipsum id dolor minim laboris elit',
  //         'occaecat aute ipsum eiusmod magna tempor elit ut',
  //       ],
  //       friends: [
  //         {
  //           id: 0,
  //           name: 'Riddle Stephenson',
  //         },
  //         {
  //           id: 1,
  //           name: 'Howard Morales',
  //         },
  //         {
  //           id: 2,
  //           name: 'Dorthy Lowery',
  //         },
  //         {
  //           id: 3,
  //           name: 'Best Barber',
  //         },
  //         {
  //           id: 4,
  //           name: 'Buchanan Montoya',
  //         },
  //         {
  //           id: 5,
  //           name: 'Gilliam Sharp',
  //         },
  //         {
  //           id: 6,
  //           name: 'Colon Humphrey',
  //         },
  //         {
  //           id: 7,
  //           name: 'Laverne Hardin',
  //         },
  //         {
  //           id: 8,
  //           name: 'Woodard Lowe',
  //         },
  //         {
  //           id: 9,
  //           name: 'Fleming Sims',
  //         },
  //       ],
  //       greeting: 'Hello, Nadia Santos! You have 10 unread messages.',
  //       favoriteDbType: faker.database.type(),
  //     };

  //     const newApplicant = {
  //       ...app,
  //       idx: i,
  //       org: orgForApplicant,
  //       target: {
  //         Org: orgForApplicant,
  //         Opening: openingForApplicant,
  //         Stage: stageForApplicant,
  //         Id: applicantId,
  //       },
  //     };
  //     localBatch.push(newApplicant);
  //   }
  //   applicantsToCreate.push(localBatch);
  // }
  console.log('Sending to mongo');
  await sendToMongo();
};

main();
