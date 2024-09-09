use shared::consumers::{MessageHandler, PlutomiConsumer};

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

async fn send_email() -> MessageHandler {
    println!("Sending email...");

    Ok("yeah".to_string())
}
