import axios from "axios";
import dayjs from "dayjs";
import base64url from "base64url";
const faker = require("faker");
import { nanoid } from "nanoid";
axios.defaults.baseURL = "http://localhost:3000/api";
require("dotenv").config();

export default function Users() {
  let new_user: NewUserInput = {
    name: `TEST_USER_${faker.name.findName()}`,
    email: `${nanoid(50)}@plutomi.com`,
    password: nanoid(10),
  };

  // For subsequent tests
  const user_id = base64url(new_user.email);
  let created_user = {}; // Placeholder

  test("Creates a user", async () => {
    const { status, data } = await axios.post("/users", new_user);

    console.log(status, data);
    expect(status).toBe(201);

    const {
      PK,
      SK,
      name,
      email,
      password,
      entity_type,
      created_at,
      org_name,
      user_role,
      user_id,
      is_sub_user,
      org_join_date,
      GSI1PK,
      GSI1SK,
    }: NewUserOutput = data;

    expect(PK).toBe(`USER#${user_id}`);
    expect(SK).toBe(PK);
    expect(GSI1PK).toBe(`ORG#NO_ORG_ASSIGNED`);
    expect(GSI1SK).toBe(`USER#${name}`); // Allows for 'Get all users in an org sorted by name
    expect(name).toBe(new_user.name);
    expect(email).toBe(new_user.email);
    expect(entity_type).toBe("USER");
    expect(created_at).toContain(dayjs().toISOString().slice(0, 9)); // Today's date, YYYY-MM-DD
    expect(org_name).toBe("NO_ORG_ASSIGNED");
    expect(org_join_date).toBe("NO_ORG_ASSIGNED");
    expect(user_role).toBe("BASIC");
    expect(user_id).toBe(user_id);
    expect(is_sub_user).toBe(false);
    expect(password).toBe(undefined);

    created_user = data; // Set new created user as a template for the rest of tests
  });

  test("Retrieve a user by email", async () => {
    const { status, data } = await axios.get(`/users/${user_id}`);
    console.log(status, data);

    expect(status).toBe(200);
    expect(data).toStrictEqual(created_user);
  });

  test("Tries to retrieve a non-existent user", async () => {
    await axios.get(`/users/${nanoid(1000)}`).catch((error) => {
      const { response } = error;
      const { status, data } = response;

      expect(status).toBe(404);
      expect(data.message).toBe("User not found");
    });
  });
}
