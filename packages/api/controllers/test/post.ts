import type { RequestHandler } from "express";
import KSUID from "ksuid";

export const post: RequestHandler = async (req, res) => {
  const id = KSUID.randomSync().string;
  const requestId = `REQUEST - ${id}`;
  console.time(requestId);

  const dbId = `DB - ${id}`;
  try {
    console.time(dbId);
    await req.items.insertOne({
      // @ts-expect-error f
      _id: id,
      index: 0,
      guid: "86ac96ed-6204-4453-a9b4-33c085591757",
      isActive: true,
      balance: "$3,761.94",
      picture: "http://placehold.it/32x32",
      age: 26,
      eyeColor: "green",
      name: "Riley Stephens",
      gender: "male",
      company: "MOBILDATA",
      email: "rileystephens@mobildata.com",
      phone: "+1 (882) 529-2450",
      address: "290 Croton Loop, Springville, Wyoming, 1848",
      about:
        "Adipisicing esse Lorem irure incididunt. Fugiat nostrud veniam ea labore enim dolore cillum culpa laborum anim reprehenderit. Velit nisi mollit reprehenderit aute consequat anim dolore incididunt laboris labore exercitation. Reprehenderit aliqua proident ex reprehenderit quis pariatur et do. Ad ut reprehenderit eu mollit elit qui nisi consectetur eu laborum pariatur excepteur. Id enim est do cillum officia consequat aute nisi pariatur reprehenderit reprehenderit esse.\r\n",
      registered: "2015-08-28T11:01:44 +04:00",
      latitude: -42.574808,
      longitude: 66.830295,
      tags: [
        "veniam",
        "nostrud",
        "duis",
        "duis",
        "deserunt",
        "commodo",
        "cupidatat"
      ],
      friends: [
        {
          id: 0,
          name: "Trudy Spencer"
        },
        {
          id: 1,
          name: "Clare Mejia"
        },
        {
          id: 2,
          name: "Sexton Webster"
        }
      ],
      greeting: "Hello, Riley Stephens! You have 1 unread messages.",
      favoriteFruit: "banana"
    });
    console.timeEnd(dbId);
    res.status(200).json({ message: "OK" });
    console.timeEnd(requestId);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
