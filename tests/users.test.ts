import axios from "axios";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
axios.defaults.baseURL = "http://localhost:3000/api";

export default function Users() {
  const new_user: NewUserInput = {
    name: `${nanoid(5)} ${nanoid(5)}`,
    email: `${nanoid(50)}@plutomi.com`,
    password: nanoid(10),
  };

  const ID_LENGTH = parseInt(process.env.ID_LENGTH);

  test("Creates a user", async () => {
    const { status, data } = await axios.post("/users", new_user);

    expect(status).toBe(201);
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
      role,
      user_id,
      is_sub_user,
    } = data.user;

    expect(PK).toMatch(`USER#`);
    expect(PK).toHaveLength(ID_LENGTH + 5); // Accounting for USER#
    expect(SK).toMatch(`USER#`);
    expect(SK).toHaveLength(ID_LENGTH + 5); // Accounting for USER#
    expect(name).toBe(new_user.name);
    expect(email).toBe(new_user.email);
    expect(entity_type).toBe("USER");
    expect(created_at).toContain(dayjs().toISOString().slice(0, 9)); // Today's date, YYYY-MM-DD
    expect(org).toBe("NO_ORG_ASSIGNED");
    expect(role).toBe("BASIC");
    expect(user_id).toHaveLength(ID_LENGTH);
    expect(is_sub_user).toBe(false);
    expect(password).not.toBe(new_user.password);
  });
}
