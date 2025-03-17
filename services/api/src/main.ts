class User {
  name: string;
  suspended: boolean;
  constructor(name, suspended) {
    this.name = name;
    this.suspended = suspended;
  }
}

function main() {
  const user = {
    name: "John Doe",
    suspended: false,
  };

  if (user.suspended) {
    console.log("User is suspended");
    return;
  }

  user.suspended;
}

main();
