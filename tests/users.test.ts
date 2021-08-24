import axios from "axios";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
axios.defaults.baseURL = "http://localhost:3000/api";
let created_user = {
  user_id: "",
};

export default function Users() {
  const new_user: NewUserInput = {
    name: `${nanoid(5)} ${nanoid(5)}`,
    email: `${nanoid(50)}@plutomi.com`,
  };

  test("Creates a user", async () => {
    const { status, data } = await axios.post("/users", new_user);

    expect(status).toBe(201);
    expect(data.message).toBe("User created!");

    const { name, email, entity_type, created_at, org, role } = data.user;

    expect(name).toBe(new_user.name);
    expect(email).toBe(new_user.email);
    expect(entity_type).toBe("USER");
    expect(created_at).toContain(dayjs().toISOString().slice(0, 9)); // Today's date, YYYY-MM-DD
    expect(org).toBe("NO_ORG_ASSIGNED");
    expect(role).toBe("BASIC");
  });
}
