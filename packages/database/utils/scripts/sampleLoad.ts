// import { faker } from "@faker-js/faker";
// import { randomNumberInclusive } from "@plutomi/shared";
// import { nanoid } from "nanoid";
// import { connectToDatabase } from "./connectToDatabase";

// const orgs = 5;

// export const load = async () => {
//   const { items } = await connectToDatabase({ databaseName: "plutomi-local" });

//   await items.deleteMany({});
//   await items.deleteMany({});
//   await items.deleteMany({});
//   await items.deleteMany({});
//   await items.deleteMany({});

//   console.log("DONE DELETING");
//   for (let orgI = 0; orgI < orgs; orgI += 1) {
//     console.log(`ORG ${orgI}`);
//     const allWorkspaces = [];
//     const orgId = `org_${nanoid()}`;
//     const org = {
//       _id: orgId,
//       entityType: "org",
//       name: faker.company.name(),
//       related_to: [
//         { id: orgId, type: "self" },
//         { id: "org", type: "entity" }
//       ]
//     };
//     // @ts-expect-error yeah
//     // eslint-disable-next-line no-await-in-loop
//     await items.insertOne(org);

//     const totalWorkspaces = randomNumberInclusive(2, 30);
//     console.log(`Total workspaces ${totalWorkspaces}`);
//     for (let workspaceI = 0; workspaceI < totalWorkspaces; workspaceI += 1) {
//       const workspaceId = `workspace_${nanoid()}`;
//       const workspace = {
//         _id: workspaceId,
//         org: orgId,
//         entityType: "workspace",
//         name:
//           Math.random() > 0.5
//             ? faker.company.buzzNoun()
//             : faker.company.catchPhraseDescriptor(),
//         related_to: [
//           { id: workspaceId, type: "self" },
//           { id: "workspace", type: "entity" },
//           { id: org._id, type: "workspace" }
//         ]
//       };

//       allWorkspaces.push(workspace);
//     }
//     // @ts-expect-error yeah
//     // eslint-disable-next-line no-await-in-loop
//     await items.insertMany(allWorkspaces);

//     // eslint-disable-next-line no-restricted-syntax, no-await-in-loop
//     for await (const workspace of allWorkspaces) {
//       // Create applications
//       const applicationsAndStages = [];
//       for (
//         let application = 0;
//         application < randomNumberInclusive(2, 3000);
//         application += 1
//       ) {
//         if (application % 50 === 0) {
//           console.log("application", application);
//         }
//         const applicationId = `application_${nanoid()}`;
//         const newApplication = {
//           _id: applicationId,
//           entityType: "application",
//           org: org._id,
//           workspace: workspace._id,
//           customId: faker.database.mongodbObjectId(),
//           name: faker.person.jobTitle(),
//           salary: randomNumberInclusive(10000, 1000000),
//           location: faker.location.city(),
//           description: faker.lorem.paragraph(),
//           markdown: faker.lorem.paragraphs({ min: 5, max: 20 }),
//           files: [Array.from({ length: 5 }, () => faker.image.avatarGitHub())],
//           related_to: [
//             { id: applicationId, type: "self" },
//             { id: "application", type: "entity" },
//             { id: workspace._id, type: "application" },
//             { id: org._id, type: "application" }
//           ]
//         };

//         applicationsAndStages.push(newApplication);

//         for (
//           let stages = 0;
//           stages < randomNumberInclusive(3, 30);
//           stages += 1
//         ) {
//           if (stages % 5 === 0) {
//             console.log("stages", stages);
//           }

//           const stageId = `stage_${nanoid()}`;

//           const newStage = {
//             _id: stageId,
//             entityType: "stage",
//             org: org._id,
//             workspace: workspace._id,
//             application: applicationId,
//             name: faker.person.jobType(),
//             description: faker.lorem.paragraphs({ min: 1, max: 20 }),
//             related_to: [
//               { id: stageId, type: "self" },
//               { id: "stage", type: "entity" },
//               { id: applicationId, type: "stage" },
//               { id: workspace._id, type: "stage" },
//               { id: org._id, type: "stage" }
//             ]
//           };

//           applicationsAndStages.push(newStage);
//           // ! TODO: Add applicants here

//           const applicantsPerStage = randomNumberInclusive(500, 100000);
//           const applicantData = [];

//           console.log(`Applicants per stage`, applicantsPerStage);
//           for (
//             let applicantsI = 0;
//             applicantsI < applicantsPerStage;
//             applicantsI += 1
//           ) {
//             if (applicantsI % 100 === 0) {
//               console.log("applicants", applicantsI);
//             }

//             const applicantId = `applicant_${nanoid()}`;
//             const applicant = {
//               _id: applicantId,
//               name: faker.person.fullName(),
//               email: faker.internet.email(),
//               entityType: "applicant",
//               org: workspace.org,
//               workspace: workspace._id,
//               application: applicationId,
//               stage: stageId,
//               metadata: {
//                 vehicle: faker.vehicle.vehicle(),
//                 date_of_birth: faker.date.past(),
//                 phone_number: faker.phone.number(),
//                 tags: Array.from({ length: 5 }, () => faker.word.adjective()),
//                 address: faker.location.streetAddress(),
//                 city: faker.location.city(),
//                 state: faker.location.state(),
//                 zip_code: faker.location.zipCode(),
//                 country: faker.location.country(),
//                 description: faker.lorem.paragraph(),
//                 avatar: faker.image.avatar(),
//                 website: faker.internet.url(),
//                 long_description: faker.lorem.paragraphs({ min: 2, max: 100 }),
//                 files: Array.from(
//                   { length: randomNumberInclusive(3, 10) },
//                   () => faker.system.fileName()
//                 ),
//                 notes: Array.from(
//                   { length: randomNumberInclusive(3, 10) },
//                   () => faker.lorem.paragraph()
//                 )
//               },
//               related_to: [
//                 { id: applicantId, type: "self" },
//                 { id: "applicant", type: "entity" },
//                 { id: workspace._id, type: "applicant" },
//                 { id: applicationId, type: "applicant" },
//                 { id: stageId, type: "applicant" },
//                 { id: org._id, type: "applicant" }
//               ]
//             };

//             const filesForApplicant = [];
//             // Create files
//             for (let i = 0; i < randomNumberInclusive(1, 10); i += 1) {
//               const fileId = `file_${nanoid()}`;
//               const file = {
//                 _id: fileId,
//                 entityType: "file",
//                 name: faker.system.fileName(),
//                 applicant: applicantId,
//                 org: org._id,
//                 workspace: workspace._id,
//                 related_to: [
//                   { id: fileId, type: "self" },
//                   { id: "file", type: "entity" },
//                   { id: applicantId, type: "file" },
//                   { id: workspace._id, type: "file" },
//                   { id: org._id, type: "file" }
//                 ]
//               };

//               filesForApplicant.push(file);
//             }

//             const notesForApplicant = [];
//             // Create note
//             for (let i = 0; i < randomNumberInclusive(1, 5); i += 1) {
//               const noteId = `note_${nanoid()}`;
//               const note = {
//                 _id: noteId,
//                 entityType: "note",
//                 applicant: applicantId,
//                 org: org._id,
//                 workspace: workspace._id,
//                 related_to: [
//                   { id: noteId, type: "self" },
//                   { id: "note", type: "entity" },
//                   { id: applicantId, type: "note" },
//                   { id: workspace._id, type: "note" },
//                   { id: org._id, type: "note" }
//                 ]
//               };

//               notesForApplicant.push(note);
//             }

//             applicantData.push(applicant);
//             applicantData.push(...notesForApplicant);
//             applicantData.push(...filesForApplicant);
//           }

//           try {
//             console.log("inserting");
//             // @ts-expect-error yeah
//             // eslint-disable-next-line no-await-in-loop
//             await items.insertMany([...applicantData]);
//             console.log("Done inserting applicant data");
//             // console.log(`inserting applicant`);
//           } catch (error) {
//             console.error(`ERROR INSERTIN GAPPLINGATNS ${error}`);
//           }
//         }
//       }

//       console.log("Inserting applications");
//       // @ts-expect-error yeah
//       await items.insertMany(applicationsAndStages);

//       const webhooksPerWorkspace = [];

//       for (
//         let webhooks = 0;
//         webhooks < randomNumberInclusive(1, 100);
//         webhooks += 1
//       ) {
//         const webhookId = `webhook_${nanoid()}`;
//         const newWebhook = {
//           _id: webhookId,
//           entityType: "webhook",
//           org: org._id,
//           workspace: workspace._id,
//           name: faker.lorem.slug(),
//           short_description: faker.lorem.sentences(),
//           url: faker.internet.url(),
//           related_to: [
//             { id: webhookId, type: "self" },
//             { id: "webhook", type: "entity" },
//             { id: workspace._id, type: "webhook" },
//             { id: org._id, type: "webhook" }
//           ]
//         };
//         webhooksPerWorkspace.push(newWebhook);
//       }
//       // @ts-expect-error yeah
//       await items.insertMany(webhooksPerWorkspace);
//     }
//   }
// };

// load();
