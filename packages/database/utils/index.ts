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
import { nanoid } from "nanoid";

const orgs = 5;

export const load = async () => {
  const { items } = await connectToDatabase({ databaseName: "plutomi-local" });

  console.log("DONE DELETING");
  for (let orgI = 0; orgI < orgs; orgI += 1) {
    console.log(`ORG ${orgI}`);
    const allWorkspaces = [];
    const orgId = `org_${nanoid()}`;
    const org = {
      _id: orgId,
      entityType: "org",
      name: faker.company.name(),
      relatedTo: [{ id: orgId, type: "self" }]
    };
    // @ts-expect-error yeah
    // eslint-disable-next-line no-await-in-loop
    await items.insertOne(org);

    const totalWorkspaces = randomNumberInclusive(2, 4);
    console.log(`Total workspaces ${totalWorkspaces}`);
    for (let workspaceI = 0; workspaceI < totalWorkspaces; workspaceI += 1) {
      const workspaceId = `workspace_${nanoid()}`;
      const workspace = {
        _id: workspaceId,
        org: orgId,
        entityType: "workspace",
        name:
          Math.random() > 0.5
            ? faker.company.buzzNoun()
            : faker.company.catchPhraseDescriptor(),
        relatedTo: [
          { id: workspaceId, type: "self" },
          { id: org, type: "workspace" }
        ]
      };

      allWorkspaces.push(workspace);
    }
    // @ts-expect-error yeah
    // eslint-disable-next-line no-await-in-loop
    await items.insertMany(allWorkspaces);

    // eslint-disable-next-line no-restricted-syntax, no-await-in-loop
    for await (const workspace of allWorkspaces) {
      const totalBatches = randomNumberInclusive(10, 10);
      console.log(`Total batches: ${totalBatches}`);
      for (let batchI = 0; batchI < totalBatches; batchI += 1) {
        console.log(`Batch I ${batchI}`);
        const applicantsInThisBatch = [];
        const filesInBatch = [];
        const notesInBatch = [];
        const applicantsPerBatch = randomNumberInclusive(10000, 10000);
        for (
          let applicantsI = 0;
          applicantsI < applicantsPerBatch;
          applicantsI += 1
        ) {
          const applicantId = `applicant_${nanoid()}`;
          const applicant = {
            _id: applicantId,
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
              { id: applicantId, type: "self" },
              { id: workspace._id, type: "applicant" },
              { id: org._id, type: "applicant" }
            ]
          };

          const filesForApplicant = [];
          // Create files
          for (let i = 0; i < randomNumberInclusive(1, 10); i += 1) {
            const fileId = `file_${nanoid()}`;
            const file = {
              _id: fileId,
              entityType: "file",
              name: faker.system.fileName(),
              applicant: applicantId,
              org: org._id,
              workspace: workspace._id,
              relatedTo: [
                { id: fileId, type: "self" },
                { id: applicantId, type: "file" },
                { id: workspace._id, type: "file" },
                { id: org._id, type: "file" }
              ]
            };

            filesForApplicant.push(file);
          }

          const notesForApplicant = [];
          // Create note
          for (let i = 0; i < randomNumberInclusive(1, 5); i += 1) {
            const noteId = `note_${nanoid()}`;
            const note = {
              _id: noteId,
              entityType: "note",
              applicant: applicantId,
              org: org._id,
              workspace: workspace._id,
              relatedTo: [
                { id: noteId, type: "self" },
                { id: applicantId, type: "note" },
                { id: workspace, type: "note" },
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
