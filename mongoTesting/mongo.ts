import { AllCollectionsResponse, connectToDatabase } from '../utils/connectToDatabase';
import { randomNumberInclusive } from '../utils/randomNumberInclusive';
import { faker } from '@faker-js/faker';
import { nanoid } from 'nanoid';
import { Collection } from 'mongodb';
import { randomItemFromArray } from '../utils/randomItemFromArray';
import {
  AllEntities,
  IndexableProperties,
  IndexedTargetArray,
  IndexedTargetArrayItem,
} from '../@types/indexableProperties';
import dayjs from 'dayjs';
import axios from 'axios';

const numberOfBatches = 100;
const applicantsPerBatch = 4000;
const orgsToCreate = 100;

// https://dev.to/trekhleb/weighted-random-algorithm-in-javascript-1pdc
const weightedRandom = (items: string[], weights: number[]) => {
  // Preparing the cumulative weights array.
  // For example:
  // - weights = [1, 4, 3]
  // - cumulativeWeights = [1, 5, 8]
  const cumulativeWeights = [];
  for (let i = 0; i < weights.length; i += 1) {
    cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0);
  }

  // Getting the random number in a range of [0...sum(weights)]
  // For example:
  // - weights = [1, 4, 3]
  // - maxCumulativeWeight = 8
  // - range for the random number is [0...8]
  const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
  const randomNumber = maxCumulativeWeight * Math.random();

  // Picking the random item based on its weight.
  // The items with higher weight will be picked more often.
  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    if (cumulativeWeights[itemIndex] >= randomNumber) {
      return items[itemIndex];
    }
  }
};

const main = async () => {
  try {
    const { client, collections } = await connectToDatabase({ databaseName: 'development' });

    await collections.Applicants.createIndex({});
    let processedApplicants = 0;

    const orgs = [];
    const orgWeights = [];
    Array.from({ length: orgsToCreate }).forEach(() => {
      orgs.push(faker.company.companyName());
      orgWeights.push(randomNumberInclusive(1, 100));
    });
    console.log(`ORGS`, orgs);
    console.log(`Weights`, orgWeights);

    const groupId = ``;
    const clusterName = ``;
    for await (const org of orgs) {
      await axios.post(
        `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/clusters/${clusterName}/fts/indexes`,
        {
          mappings: {
            dynamic: false,
            fields: {
              orgnameData: {
                dynamic: true,
                type: 'document',
              },
            },
          },
        },
      );
    }
    // TODO Body

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

    for (let i = 0; i < numberOfBatches; i++) {
      const localBatch: any = [];

      for (let i = 0; i < applicantsPerBatch; i++) {
        const orgForApplicant = weightedRandom(orgs, orgWeights);

        const getOpening = () => {
          const num = Math.random();

          for (const opening of openings) {
            if (num < opening.weight) {
              // To make it unique
              return `${opening.name}-${orgForApplicant}`;
            }
          }
        };
        const openingForApplicant = getOpening();

        const getStage = () => {
          const num = Math.random();

          for (const stage of stages) {
            if (num < stage.weight) {
              // To make it unique
              return `${stage.name}-${openingForApplicant}-${orgForApplicant}`;
            }
          }
        };
        const stageForApplicant = getStage();
        const applicantId = nanoid(50);
        const app = {
          type: 'Applicant',
          music: faker.music.genre(),
          isActive: Math.random() > 0.5,
          balance: Math.random() * randomNumberInclusive(1, 10000),
          picture: 'http://placehold.it/32x32',
          age: randomNumberInclusive(10, 99),
          eyeColor: faker.commerce.color(),
          name: faker.name.findName(),
          gender: faker.name.gender(true),
          company: orgForApplicant,
          email: faker.internet.email(),
          phone: faker.phone.phoneNumber(),
          address: faker.address.streetAddress(),
          about: faker.lorem.sentences(randomNumberInclusive(3, 100)),
          desc: faker.commerce.productDescription(),
          id: applicantId,
          description: faker.commerce.productDescription(),
          adjective: faker.commerce.productAdjective(),
          material: faker.commerce.productMaterial(),
          noun: faker.hacker.noun(),
          account: faker.finance.accountName(),
          direction: faker.address.direction(),
          city: faker.address.city(),
          country: faker.address.country(),
          latitude: faker.address.latitude(),
          longitude: faker.address.longitude(),
          createdAt: faker.date.between(dayjs().subtract(5, 'years').toDate(), dayjs().toDate()),
          updatedAt: faker.date.between(dayjs().subtract(5, 'years').toDate(), dayjs().toDate()),
          birthDate: faker.date.between(
            dayjs().subtract(17, 'years').toDate(),
            dayjs().subtract(80, 'years').toDate(),
          ),
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
          greeting: 'Hello, Nadia Santos! You have 10 unread messages.',
          favoriteDbType: faker.database.type(),
          orgId: orgForApplicant,
          openingId: openingForApplicant,
          stageId: stageForApplicant,
        };

        const newApplicant = {
          idx: i,
          // TODO Unique search index will be created per org
          [`${orgForApplicant}Data`]: app,
        };
        localBatch.push(newApplicant);
      }
      applicantsToCreate.push(localBatch);
    }

    const sendToMongo = async (collections: AllCollectionsResponse) => {
      console.log(`Creating`, applicantsToCreate.length, `applicants!`);
      for await (const batch of applicantsToCreate) {
        const bidx = applicantsToCreate.indexOf(batch) + 1;

        await collections.Applicants.insertMany(batch);

        processedApplicants += batch.length;
        console.log(
          `Done processing batch`,
          bidx,
          ` - ${batch.length} applicants - Total: ${processedApplicants} / ${
            numberOfBatches * applicantsPerBatch
          }`,
        );
      }
      console.log('Done!');
    };

    console.log('Sending to mongo');
    await sendToMongo(collections);
  } catch (error) {
    console.error(`error `, error);
  }
};

main();
