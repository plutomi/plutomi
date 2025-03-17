struct User {
    name: String,
    age: u32,
    suspended: bool,
    email: String,
}

fn main() {
   let user: User = {
       name: "John Doe",
       age: 30,
       suspended: false,
       email: "john.doe@example.com",
   };


}
