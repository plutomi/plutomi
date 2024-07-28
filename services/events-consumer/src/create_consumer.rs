use async_nats::jetstream::{
    consumer::{pull::Config, Consumer},
    stream::Stream,
};

pub struct SetupConsumerOptions<'a> {
    // The stream to create the consumer on
    pub stream: &'a Stream,
    // The name of the consumer
    pub name: &'a str,
    // The subjects to filter on
    pub subjects: Vec<String>,
}

/**
 * Given a stream, create a consumer with the given name and subjects
 */
pub async fn create_consumer<'a>(
    SetupConsumerOptions {
        stream,
        name,
        subjects,
    }: SetupConsumerOptions<'a>,
) -> Result<Consumer<Config>, String> {
    stream
        .get_or_create_consumer(
            name,
            Config {
                durable_name: Some(name.to_string()),
                filter_subjects: subjects,
                ..Default::default()
            },
        )
        .await
        .map_err(|e| format!("An error occurred setting up the {} consumer: {}", name, e))
}
