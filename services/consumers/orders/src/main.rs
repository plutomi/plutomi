use shared::consumers::PlutomiConsumer;

fn main() {
    println!("Hello, world!");

    let plutomi_consumer = PlutomiConsumer::new(
        "notifications-orders-consumer",
        "notifications",
        "todo",
        "orders",
        send_email,
    );
}

async fn send_email() -> Result<(), String> {
    println!("Sending email...");
    Ok(())
}
