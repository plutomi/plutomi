import { connectToDatabase } from './utils/connectToDatabase';
import { randomNumberInclusive } from './utils/randomNumberInclusive';
import { faker } from '@faker-js/faker';
import { nanoid } from 'nanoid';
import { Collection } from 'mongodb';
import { randomItemFromArray } from './utils/randomItemFromArray';
import {
  AllEntities,
  IndexableProperties,
  IndexedTargetArray,
  IndexedTargetArrayItem,
} from './@types/indexableProperties';

const numberOfBatches = 100;
const applicantsPerBatch = 4000;
const questionsPerAppMin = 3;
const questionsPerAppMax = 50;
const main = async () => {
  try {
    const { client, db } = await connectToDatabase({ databaseName: 'development' });
    let processedApplicants = 0;

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

        const orgForApplicant = getOrg();

        const getOpening = () => {
          const num = Math.random();

          for (const opening of openings) {
            if (num < opening.weight) {
              return `${opening.name}-${orgForApplicant}`;
            }
          }
        };
        const openingForApplicant = getOpening();

        const getStage = () => {
          const num = Math.random();

          for (const stage of stages) {
            if (num < stage.weight) {
              return `${stage.name}-${openingForApplicant}-${orgForApplicant}`;
            }
          }
        };
        const stageForApplicant = getStage();
        const applicantId = nanoid(50);
        const app = {
          type: 'Applicant',
          isActive: Math.random() > 0.5,
          balance: Math.random() * randomNumberInclusive(1, 10000),
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
          id: applicantId,
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
          target: [
            {
              k: faker.music.genre(),
              v: faker.name.findName(),
            },
            {
              k: faker.music.genre(),
              v: faker.name.findName(),
            },
            {
              k: faker.music.genre(),
              v: faker.name.findName(),
            },
            {
              k: faker.music.genre(),
              v: faker.name.findName(),
            },
            {
              k: faker.music.genre(),
              v: faker.name.findName(),
            },
            {
              k: faker.music.genre(),
              v: faker.name.findName(),
            },
            {
              k: faker.music.genre(),
              v: faker.name.findName(),
            },
            {
              k: faker.music.genre(),
              v: faker.name.findName(),
            },
            {
              k: faker.music.genre(),
              v: faker.name.findName(),
            },
            {
              k: faker.music.genre(),
              v: faker.name.findName(),
            },
          ],
          greeting: 'Hello, Nadia Santos! You have 10 unread messages.',
          favoriteDbType: faker.database.type(),
        };

        const newApplicant: {
          target: IndexedTargetArray;
          [x: string | number | symbol]: unknown;
        } = {
          ...app,
          idx: i,
          orgId: orgForApplicant,
          target: [
            { id: AllEntities.Applicant, type: 'entityType' },
            { id: applicantId, type: 'id' },
            {
              id: orgForApplicant,
              type: AllEntities.Org,
            },
            { id: openingForApplicant, type: AllEntities.Opening },
            { id: stageForApplicant, type: AllEntities.Stage },
          ],
        };
        localBatch.push(newApplicant);
      }
      applicantsToCreate.push(localBatch);
    }

    const sendToMongo = async ({ db }: { db: Collection }) => {
      console.log(`Creating`, applicantsToCreate.length, `applicants!`);
      for await (const batch of applicantsToCreate) {
        const bidx = applicantsToCreate.indexOf(batch) + 1;

        await db.insertMany(batch);

        const randomApplicant: any = randomItemFromArray(batch);

        const questionsPerApplicant = randomNumberInclusive(questionsPerAppMin, questionsPerAppMax);
        const generateQuestions = (): any[] => {
          const allQuestions = [];

          for (let i = 0; i < questionsPerApplicant; i++) {
            const questionId = nanoid(50);
            const questionAnswer: {
              target: IndexedTargetArray;
              [x: string | number | symbol]: unknown;
            } = {
              id: questionId,
              answer: nanoid(50),
              type: 'Question',
              orgId: randomApplicant.orgId,
              target: [
                { id: AllEntities.Question, type: 'entityType' },
                { id: questionId, type: 'id' },
                {
                  id: randomApplicant.orgId,
                  type: AllEntities.Org,
                },
                { id: randomApplicant.id, type: AllEntities.Applicant }, // Index lookup TODO!
              ],
            };

            allQuestions.push(questionAnswer);
          }

          return allQuestions;
        };

        const allQuestions = generateQuestions();
        //  console.log(allQuestions);
        try {
          await db.insertMany(allQuestions);
        } catch (error) {
          console.error(`Error creating questions`, error);
        }
        console.log(
          `Inserted ${allQuestions.length} questions for applicant ${randomApplicant.id}`,
        );
        console.log(`sample`, allQuestions[0].target);
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
    await sendToMongo({ db });
  } catch (error) {
    console.error(`error `, error);
  }
};

main();
