import { connectToDatabase } from './utils/connectToDatabase';
import { randomNumberInclusive } from './utils/randomNumberInclusive';
import { faker } from '@faker-js/faker';
import { nanoid } from 'nanoid';
import { items } from './utils/connectToDatabase';
import dayjs from 'dayjs';
import { UserEntity } from './models';
import { Filter } from 'mongodb';
// Direct target array!
// Applicant info: { $or: [ { $and: [ { target: { id: "DI_46-2lfGbv3xeMlSLA1UsomjAa_tr3cHYWSLnIMsAtKI2gyb" }} ]}] }

const numberOfBatches = randomNumberInclusive(30, 50);
const applicantsPerBatch = randomNumberInclusive(4000, 5000);
const orgsToCreate = randomNumberInclusive(1, 1);
const dbName = 'plutomi';

// Fidning them in the UI
// var findElements = function(tag, text) {
//   var elements = document.getElementsByTagName(tag);
//   var found = [];
//   for (var i = 0; i < elements.length; i++) {
//     if (elements[i].innerHTML.includes(text) ) {
//       found.push(elements[i]);
//     }
//   }
//   return found;
// }
// let elements = findElements('a', 'Index')

// orgsInDB = elements.map((item) => item.outerText)

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
  const startTime = dayjs();
  try {
    await connectToDatabase();

    // await items.deleteMany({});

    try {
      const a = [1, 2, 3];

      const r = Promise.all(
        a.map(async (i) => {
          console.log(`I:`, i);
          const findUserFilter: Filter<UserEntity> =
            // @ts-ignore
            { _id: 'ORG#plutomi#APPLICANT#iKFKq2-nRi', 'data.age': 0 };

          const b = await items.findOneAndUpdate(
            findUserFilter,
            // @ts-ignore

            { $inc: { 'data.age': 1 } },
          );
          console.log(b);
          console.log('Updated ', i);
        }),
      );
      console.log('PROMISES DONE');
    } catch (error) {
      console.error(`ERROR UPDATING`, error);
    }

    console.log('OUT OF LOOP');
    // let processedApplicants = 0;

    // // Power law distribution
    // const topOrgs = ['plutomi'];
    // const orgs = [...topOrgs];
    // const orgWeights = []; // TODO remove
    // Array.from({ length: orgsToCreate }).forEach((org) => {
    //   const companyName = faker.company.companyName();
    //   console.log('Company', companyName);
    //   console.log('Company 2', companyName.toLowerCase());
    //   console.log('typeof', typeof companyName.toLowerCase());

    //   console.log('Company 3', companyName.toLowerCase().replace(/[^a-z]/gi, ''));

    //   orgs.push(
    //     companyName
    //       .toLowerCase()
    //       .toString()
    //       .replace(/[^a-z]/gi, ''),
    //   );
    // });

    // orgs.forEach((org, idx) => {
    //   // TODO: Temporary for keeping distribution accurate
    //   //  Power rule, top 30 users drive most of the traffic
    //   if (idx < randomNumberInclusive(1, 5)) {
    //     orgWeights.push(randomNumberInclusive(100, 200));
    //   } else if (idx < randomNumberInclusive(10, 30)) {
    //     orgWeights.push(randomNumberInclusive(1, 100));
    //   } else {
    //     orgWeights.push(randomNumberInclusive(1, 75));
    //   }

    //   // // Skipping power rule
    //   // orgWeights.push(randomNumberInclusive(1, 100));
    // });
    // console.log(`ORGS`, orgs);
    // console.log(`Weights`, orgWeights);

    // const groupId = `62e72d3d7be6ee26f42c0ec7`;
    // const clusterName = `Cluster0`;
    // const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/clusters/${clusterName}/fts/indexes`;

    // // !Note disabled ofr now
    // // const digestAuth = new AxiosDigestAuth({
    // //   username: publicKey,
    // //   password: privateKey,
    // // });
    // // for await (const org of orgs) {
    // //   const data = {
    // //     name: `${org}Index`,
    // //     collectionName: collections.Applicants.collectionName,
    // //     database: dbName,
    // //     mappings: {
    // //       dynamic: false,
    // //       fields: {
    // //         ${org}Data: {
    // //           dynamic: true,
    // //           type: 'document',
    // //         },
    // //       },
    // //     },
    // //   };

    // //   console.log(`Creating search index for org ${org}`);
    // //   try {
    // //     await digestAuth.request({
    // //       url,
    // //       data,
    // //       method: 'POST',
    // //       headers: { Accept: 'application/json' },
    // //     });
    // //     console.log('Created!');
    // //   } catch (error) {
    // //     if (error.response.data.detail === 'Duplicate Index.') {
    // //       console.log('Duplicate index for ', org);
    // //     } else {
    // //       console.error(`Error creating search index`, error);
    // //     }
    // //   }
    // // }

    // // // TODO update this with random weighted
    // // const openings = [
    // //   {
    // //     name: 'NYC',
    // //     weight: 0.24,
    // //   },
    // //   {
    // //     name: 'Miami',
    // //     weight: 0.42,
    // //   },
    // //   {
    // //     name: 'Chicago',
    // //     weight: 0.69,
    // //   },
    // //   {
    // //     name: 'Los Angeles',
    // //     weight: 0.84,
    // //   },
    // //   {
    // //     name: 'Toronto',
    // //     weight: 0.92,
    // //   },
    // //   {
    // //     name: 'Seattle',
    // //     weight: 1,
    // //   },
    // // ];

    // // const stages = [
    // //   {
    // //     name: 'Questionnaire',
    // //     weight: 0.17,
    // //   },
    // //   {
    // //     name: 'Interviewing',
    // //     weight: 0.42,
    // //   },
    // //   {
    // //     name: 'Rejected',
    // //     weight: 0.95,
    // //   },
    // //   {
    // //     name: 'Hired',
    // //     weight: 1,
    // //   },
    // // ];

    // // let applicantsToCreate: any = [];

    // // const orgDistribution = {}; // TODO this is broken
    // // for (let i = 0; i < numberOfBatches; i++) {
    // //   const localBatch: any = [];

    // //   for (let i = 0; i < applicantsPerBatch; i++) {
    // //     const orgForApplicant = weightedRandom(orgs, orgWeights);

    // //     if (orgForApplicant in orgDistribution) {
    // //       orgDistribution[orgForApplicant].value = orgDistribution[orgForApplicant].value++;
    // //     } else {
    // //       orgDistribution[orgForApplicant] = {
    // //         value: 1,
    // //       };
    // //     }
    // //     const getOpening = () => {
    // //       const num = Math.random();

    // //       for (const opening of openings) {
    // //         if (num < opening.weight) {
    // //           return opening.name;
    // //         }
    // //       }
    // //     };
    // //     const openingForApplicant = getOpening();

    // //     const getStage = () => {
    // //       const num = Math.random();

    // //       for (const stage of stages) {
    // //         if (num < stage.weight) {
    // //           return stage.name;
    // //         }
    // //       }
    // //     };

    // //     const stageForApplicant = getStage();
    // //     const applicantId = nanoid(10);
    // //     const createdAt = faker.date.between(
    // //       dayjs().subtract(5, 'years').toDate(),
    // //       dayjs().toDate(),
    // //     );
    // //     const updatedAt = faker.date.between(
    // //       dayjs().subtract(5, 'years').toDate(),
    // //       dayjs().toDate(),
    // //     );

    // //     const birthDate = faker.date.between(
    // //       dayjs().subtract(80, 'years').toDate(),
    // //       dayjs().subtract(17, 'years').toDate(),
    // //     );
    // //     const app = {
    // //       _id: `ORG#${orgForApplicant}#APPLICANT#${applicantId}`,
    // //       music: faker.music.genre(),
    // //       isActive: Math.random() > 0.5,
    // //       balance: Math.random() * randomNumberInclusive(1, 10000),
    // //       picture: 'http://placehold.it/32x32',
    // //       age: randomNumberInclusive(10, 99),
    // //       eyeColor: faker.commerce.color(),
    // //       firstName: faker.name.firstName(),
    // //       lastName: faker.name.lastName(),
    // //       gender: faker.name.gender(true),
    // //       company: orgForApplicant,
    // //       email: faker.internet.email(),
    // //       phone: faker.phone.phoneNumber(),
    // //       address: faker.address.streetAddress(),
    // //       about: faker.lorem.sentences(randomNumberInclusive(3, 100)),
    // //       desc: faker.commerce.productDescription(),
    // //       id: applicantId,
    // //       description: faker.commerce.productDescription(),
    // //       adjective: faker.commerce.productAdjective(),
    // //       material: faker.commerce.productMaterial(),
    // //       noun: faker.hacker.noun(),
    // //       account: faker.finance.accountName(),
    // //       direction: faker.address.direction(),
    // //       city: faker.address.city(),

    // //       country: faker.address.country(),
    // //       latitude: faker.address.latitude(),
    // //       longitude: faker.address.longitude(),
    // //       readterms: Math.random() > 0.5,
    // //       willingToRelocate: Math.random() > 0.5,
    // //       createdAt,
    // //       updatedAt,
    // //       birthDate,
    // //       tags: [
    // //         'consectetur in esse consequat sunt labore amet consectetur',
    // //         'adipisicing dolor fugiat do sint do proident ullamco',
    // //         'nostrud aliquip cillum pariatur nisi exercitation velit dolor',
    // //         'qui laborum cillum mollit ut duis non esse',
    // //         'anim eu tempor enim excepteur laboris occaecat enim',
    // //         'voluptate et esse do incididunt est irure velit',
    // //         'anim deserunt dolor non veniam nulla labore veniam',
    // //         'magna enim qui ut excepteur commodo veniam ex',
    // //         'minim occaecat eiusmod quis eiusmod non sint consequat',
    // //         'non reprehenderit dolore pariatur aliqua qui esse mollit',
    // //         'tempor in quis pariatur laborum nulla fugiat voluptate',
    // //         'incididunt nulla dolore nulla cillum fugiat sint aliqua',
    // //         'est ad sint irure sit mollit aliqua anim',
    // //         'amet ad ad dolor aliqua sunt aliqua ut',
    // //         'irure sit do non et proident id in',
    // //         'ea occaecat sunt qui aute commodo elit irure',
    // //         'cupidatat ullamco sit sit elit do ex laborum',
    // //         'minim magna consequat Lorem aliquip voluptate dolore adipisicing',
    // //         'ut eiusmod ipsum id dolor minim laboris elit',
    // //         'occaecat aute ipsum eiusmod magna tempor elit ut',
    // //       ],
    // //       greeting: 'Hello, Nadia Santos! You have 10 unread messages.',
    // //       favoriteDbType: faker.database.type(),
    // //       orgId: orgForApplicant,
    // //       openingId: openingForApplicant,
    // //       stageId: stageForApplicant,
    // //     };

    // //     const newApplicant = {
    // //       _id: `ORG#${orgForApplicant}#APPLICANT#${applicantId}`,
    // //       id: applicantId,
    // //       orgId: orgForApplicant,
    // //       openingId: openingForApplicant,
    // //       stageId: stageForApplicant,
    // //       // TODO Unique search index will be created per org
    // //       data: app,
    // //       type: 'Applicant',
    // //       target: [
    // //         { id: 'applicant', type: 'Entity' },
    // //         { id: Math.random() > 0.5 ? 'IDLE' : 'ACTIVE', type: 'Status' },
    // //         { id: `${orgForApplicant}`, type: 'applicant' },
    // //         { id: `${orgForApplicant}-${openingForApplicant}`, type: 'applicant' },
    // //         {
    // //           id: `${orgForApplicant}-${openingForApplicant}-${stageForApplicant}`,
    // //           type: 'applicant',
    // //         },
    // //         { id: `${orgForApplicant}`, type: 'org' },
    // //         { id: `${orgForApplicant}-${openingForApplicant}`, type: 'opening' },
    // //         {
    // //           id: `${orgForApplicant}-${openingForApplicant}-${stageForApplicant}`,
    // //           type: 'stage',
    // //         },
    // //         { id: createdAt, type: 'CreatedAt' },
    // //         { id: updatedAt, type: 'UpdatedAt' },
    // //         { id: birthDate, type: 'BirthDate' },
    // //       ],
    // //     };
    // //     localBatch.push(newApplicant);
    // //   }
    // //   applicantsToCreate.push(localBatch);
    // // }

    // const sendToMongo = async () => {
    //   for await (const batch of applicantsToCreate) {
    //     const bidx = applicantsToCreate.indexOf(batch) + 1;

    //     await items.insertMany(batch);

    //     // const responses = [];

    //     // for await (const applicant of batch) {
    //     //   const textResponses = [
    //     //     'firstName',
    //     //     'lastName',
    //     //     'country',
    //     //     'email',
    //     //     'description',
    //     //     'gender',
    //     //   ];

    //     //   const booleanResponses = ['isActive', 'readterms', 'willingToRelocate'];

    //     //   const numericResponses = [
    //     //     'latitude',
    //     //     'longitude',
    //     //     'createdAt',
    //     //     'updatedAt',
    //     //     'birthDate',
    //     //     'greeting',
    //     //   ];

    //     //   const createResponses = () => {
    //     //     textResponses.forEach((item) => {
    //     //       responses.push({
    //     //         key: item,
    //     //         value: applicant.data[item],
    //     //         orgId: applicant.orgId,
    //     //         openingId: applicant.openingId,
    //     //         stageId: applicant.stageId,
    //     //         applicantId: applicant.id,
    //     //       });
    //     //     });

    //     //     booleanResponses.forEach((item) => {
    //     //       responses.push({
    //     //         key: item,
    //     //         value: applicant.data[item],
    //     //         orgId: applicant.orgId,
    //     //         openingId: applicant.openingId,
    //     //         stageId: applicant.stageId,
    //     //         applicantId: applicant.id,
    //     //       });
    //     //     });

    //     //     numericResponses.forEach((item) => {
    //     //       responses.push({
    //     //         key: item,
    //     //         value: applicant.data[item],
    //     //         orgId: applicant.orgId,
    //     //         openingId: applicant.openingId,
    //     //         stageId: applicant.stageId,
    //     //         applicantId: applicant.id,
    //     //       });
    //     //     });
    //     //   };

    //     //   // createResponses();
    //     //   // console.log(`RESPONSES`, responses);

    //     //   // if (batch.indexOf(applicant) === 0) {
    //     //   //   console.log(`Creating responses for`, applicant);
    //     //   //   console.log(responses);
    //     //   // }
    //     // }
    //     processedApplicants += batch.length;
    //     console.log(
    //       `Done processing batch`,
    //       bidx,
    //       ` - ${batch.length} applicants - Total: ${processedApplicants} / ${
    //         numberOfBatches * applicantsPerBatch
    //       }`,
    //     );

    //     // console.log(`Creating ${responses.length} responses for ${batch.length} applicants`);
    //     // await collections.Responses.insertMany(responses);
    //     // console.log(`Done!`);
    //   }
    //   console.log('Done!');
    //   const endTime = dayjs();

    //   const diff = endTime.diff(startTime, 'seconds');
    //   console.log(`Duration: ${diff} seconds, ${diff / 60} mins`);

    //   console.log('Updating all plutomi!');
    //   const start2 = dayjs();

    //   // console.log('Start');
    //   // await collections.applicants.updateMany(
    //   //   { 'target.id': /^ORG#plutomi#APPLICANTS/ },
    //   //   { $set: { testData: 'BEANS' } },
    //   // );
    //   // console.log('End');

    //   // const endTime2 = dayjs();
    //   // const diff2 = endTime2.diff(start2, 'seconds');
    //   // console.log(`Duration: ${diff2} seconds, ${diff2 / 60} mins`);
    // };

    // console.log('Sending to mongo');
    // await sendToMongo();
  } catch (error) {
    console.error(`error `, error);
  }
};

main();
