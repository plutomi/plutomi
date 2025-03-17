struct User {
    name: String,
    suspended: bool,
}

fn main() {
    let user = User {
        name: "John Doe".to_string(),
        suspended: false,
    };

    if user.suspended {
        println!("User is suspended");
        return;
    }

    // Check if the user is suspended
    assert_eq!(user.suspended, false);

    user.suspended;

    return ();
}
