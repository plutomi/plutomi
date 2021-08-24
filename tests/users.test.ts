import axios from "axios";
import dayjs from "dayjs";
const faker = require("faker");
import { nanoid } from "nanoid";
axios.defaults.baseURL = "http://localhost:3000/api";
require("dotenv").config();

export default function Users() {
  const ID_LENGTH = parseInt(process.env.ID_LENGTH);
  const new_user: NewUserInput = {
    name: `TEST_USER_${faker.name.findName()}`,
    email: `${nanoid(50)}@plutomi.com`,
    password: nanoid(10),
  };

  test("Creates a user", async () => {
    const { status, data } = await axios.post("/users", new_user);

    console.log(status, data);
    expect(status).toBe(201);
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("user");
    expect(data.message).toBe("User created!");

    const {
      PK,
      SK,
      name,
      email,
      password,
      entity_type,
      created_at,
      org,
      user_role,
      user_id,
      is_sub_user,
      org_join_date,
      GSI1PK,
      GSI1SK,
    }: NewUserOutput = data.user;

    expect(PK).toMatch(`USER#`);
    expect(PK).toHaveLength(ID_LENGTH + 5); // Accounting for USER#
    expect(SK).toBe(PK);
    expect(GSI1PK).toBe(`ORG#NO_ORG_ASSIGNED`);
    expect(GSI1SK).toBe(`USER#${name}`); // Allows for 'Get all users in an org sorted by name
    expect(name).toBe(new_user.name);
    expect(email).toBe(new_user.email);
    expect(entity_type).toBe("USER");
    expect(created_at).toContain(dayjs().toISOString().slice(0, 9)); // Today's date, YYYY-MM-DD
    expect(org).toBe("NO_ORG_ASSIGNED");
    expect(org_join_date).toBe("NO_ORG_ASSIGNED");
    expect(user_role).toBe("BASIC");
    expect(user_id).toHaveLength(ID_LENGTH);
    expect(is_sub_user).toBe(false);
    expect(password).toBe(undefined);
  });
}
