use shared::entities::Entities;

fn main() {
    println!("Hello, world!");

    println!("{}", Entities::Request.as_prefix());

    // TODO: Acceptance criteria
    // - [ ] Can read .env parsed
    // - [ ] Can connect to MongoDB
    // - [ ] Can log messages
    // - [ ] Can consume events / consumer groups
    // - [ ] Can process/ publish  events
    // - [ ] Can generate ids with shared lib
}
