// @ts-nocheck
const data = [
  { _id: "user_3810", entityType: "user" },
  { _id: "note_1", entityType: "notes" },
  { _id: "note_2", entityType: "notes" },
  { _id: "image_1", entityType: "images" },
  { _id: "image_2", entityType: "images" },
  { _id: "file_1", entityType: "files" },
  { _id: "file_2", entityType: "files" }
];

const result = data.reduce((acc, curr) => {
  if (curr.entityType === "user") {
    acc = { ...curr };
  } else {
    if (!acc[curr.entityType]) {
      acc[curr.entityType] = [];
    }
    acc[curr.entityType].push(curr);
  }
  return acc;
}, {});

console.log(result);
