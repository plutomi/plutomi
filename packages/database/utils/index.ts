/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/first */
export * from "./connectToDatabase";
export * from "./createJoinedAggregation";
export * from "./getDbName";
export * from "./createIndex";
export * from "./env";
// export * from "./scripts";

import { faker } from "@faker-js/faker";
import { randomNumberInclusive } from "@plutomi/shared";
import { connectToDatabase } from "./connectToDatabase";

const orgs = 100;

export const load = async () => {
  const { items } = await connectToDatabase({ databaseName: "plutomi-local" });

  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});
  await items.deleteMany({});

  console.log("DONE DELETING");
  for (let orgI = 0; orgI < orgs; orgI += 1) {
    console.log(`ORG ${orgI}`);
    const allWorkspaces = [];
    const org = {
      _id: `org_${orgI}`,
      entityType: "org",
      name: faker.company.name()
    };
    // @ts-expect-error yeah
    // eslint-disable-next-line no-await-in-loop
    await items.insertOne(org);

    for (
      let workspaceI = 0;
      workspaceI < randomNumberInclusive(2, 30);
      workspaceI += 1
    ) {
      const workspace = {
        _id: `workspace_${workspaceI}-${org._id}`,
        org: org._id,
        entityType: "workspace",
        name:
          Math.random() > 0.5
            ? faker.company.buzzNoun()
            : faker.company.catchPhraseDescriptor(),
        relatedTo: [{ id: org._id, type: "workspace" }]
      };

      allWorkspaces.push(workspace);
    }
    // @ts-expect-error yeah
    // eslint-disable-next-line no-await-in-loop
    await items.insertMany(allWorkspaces);

    // eslint-disable-next-line no-restricted-syntax, no-await-in-loop
    for await (const workspace of allWorkspaces) {
      for (
        let batchI = 0;
        batchI < randomNumberInclusive(30, 500);
        batchI += 1
      ) {
        console.log(`Batch I ${batchI}`);
        const applicantsInThisBatch = [];
        const filesInBatch = [];
        const notesInBatch = [];
        for (
          let applicantsI = 0;
          applicantsI < randomNumberInclusive(5, 5000);
          applicantsI += 1
        ) {
          const applicant = {
            _id: `applicant_${applicantsI}-${workspace._id}-${org._id}-${batchI}}`,
            name: faker.person.fullName(),
            email: faker.internet.email(),
            entityType: "applicant",
            org: workspace.org,
            workspace: workspace._id,
            metadata: {
              vehicle: faker.vehicle.vehicle(),
              date_of_birth: faker.date.past(),
              phone_number: faker.phone.number(),
              tags: Array.from({ length: 5 }, () => faker.word.adjective()),
              address: faker.location.streetAddress(),
              city: faker.location.city(),
              state: faker.location.state(),
              zip_code: faker.location.zipCode(),
              country: faker.location.country(),
              description: faker.lorem.paragraph(),
              avatar: faker.image.avatar(),
              website: faker.internet.url(),
              long_description: faker.lorem.paragraphs({ min: 1, max: 50 }),
              files: Array.from({ length: randomNumberInclusive(3, 10) }, () =>
                faker.system.fileName()
              ),
              notes: Array.from({ length: randomNumberInclusive(3, 10) }, () =>
                faker.lorem.paragraph()
              )
            },
            relatedTo: [
              { id: workspace._id, type: "applicant" },
              { id: org._id, type: "applicant" }
            ]
          };

          const filesForApplicant = [];
          // Create files
          for (let i = 0; i < randomNumberInclusive(1, 10); i += 1) {
            const file = {
              _id: `file_${i}-${applicant._id}`,
              entityType: "file",
              name: faker.system.fileName(),
              applicant: applicant._id,
              org: org._id,
              workspace: workspace._id,
              relatedTo: [
                { id: applicant._id, type: "file" },
                { id: workspace._id, type: "file" },
                { id: org._id, type: "file" }
              ]
            };

            filesForApplicant.push(file);
          }

          const notesForApplicant = [];
          // Create note
          for (let i = 0; i < randomNumberInclusive(1, 10); i += 1) {
            const note = {
              _id: `note_${i}-${applicant._id}`,
              entityType: "note",
              applicant: applicant._id,
              org: org._id,
              workspace: workspace._id,
              relatedTo: [
                { id: applicant._id, type: "note" },
                { id: workspace._id, type: "note" },
                { id: org._id, type: "note" }
              ]
            };

            notesForApplicant.push(note);
          }

          // eslint-disable-next-line no-await-in-loop
          applicantsInThisBatch.push(applicant);
          notesInBatch.push(...notesForApplicant);
          filesInBatch.push(...filesForApplicant);
        }

        try {
          // @ts-expect-error yeah
          // eslint-disable-next-line no-await-in-loop
          await items.insertMany([
            ...applicantsInThisBatch,
            ...notesInBatch,
            ...filesInBatch
          ]);
        } catch (error) {
          console.error(`ERROR INSERTIN GAPPLINGATNS ${error}`);
        }
      }
    }
  }
};

load();
