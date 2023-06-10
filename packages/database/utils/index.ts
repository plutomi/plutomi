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
import { connectToDatabase } from "./connectToDatabase";
import { randomNumberInclusive } from "@plutomi/shared";

const orgs = 100;
const workspacesPerOrg = 1;
const applicantsPerBatch = 1;
const batchesOfApplicants = 1;

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

  console.log("HAlf way deleting");
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
      name: faker.company.name()
    };
    // @ts-expect-error yeah
    // eslint-disable-next-line no-await-in-loop
    await items.insertOne(org);

    for (let workspaceI = 0; workspaceI < workspacesPerOrg; workspaceI += 1) {
      const workspace = {
        _id: `workspace_${workspaceI}-${org._id}`,
        org: org._id,
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

    // Add items to workspace
    allWorkspaces.map(async (workspace) => {
      for (let batchI = 0; batchI < batchesOfApplicants; batchI += 1) {
        const applicantsInThisBatch = [];

        for (
          let applicantsI = 0;
          applicantsI < applicantsPerBatch;
          applicantsI += 1
        ) {
          const applicant = {
            _id: `applicant_${applicantsI}-${workspace._id}-${org._id}-${batchI}}`,
            name: faker.person.fullName(),
            email: faker.internet.email(),
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

          applicantsInThisBatch.push(applicant);
        }
        // @ts-expect-error yeah
        // eslint-disable-next-line no-await-in-loop
        await items.insertMany(applicantsInThisBatch);
      }
    });
  }
};

load();
