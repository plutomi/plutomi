use crate::AppState;
use axum::{extract::State, http::StatusCode, Extension, Json};
use rdkafka::producer::Producer;
use serde::{Deserialize, Serialize};
use serde_json::json;
use shared::logger::LogObject;
use std::{sync::Arc, time::Duration};

#[derive(Serialize, Deserialize)]
pub struct HealthCheckResponse {
    message: &'static str,
    mysql: bool,
    kafka: bool,
    environment: String,
    docs_url: String,
}

pub async fn health_check(
    State(state): State<Arc<AppState>>,
    Extension(request_id): Extension<String>,
) -> (StatusCode, Json<HealthCheckResponse>) {
    let (mysql_check, kafka_check) = tokio::join!(
        async {
            sqlx::query!(
                r#"
                SELECT 1 as one
            "#
            )
            .fetch_one(&*state.mysql)
            .await
        },
        tokio::task::spawn_blocking({
            let producer = state.kafka.producer.clone();
            move || {
                producer
                    .client()
                    .fetch_metadata(None, Duration::from_secs(2))
            }
        }),
    );
    let kafka_metadata = kafka_check.ok().and_then(|res| res.ok());

    // Log the health check response and metadata
    if let Some(metadata) = &kafka_metadata {
        // Extract brokers
        let brokers: Vec<_> = metadata
            .brokers()
            .into_iter()
            .map(|broker| {
                serde_json::json!({
                    "id": broker.id(),
                    "host": broker.host(),
                    "port": broker.port(),
                })
            })
            .collect();

        // Extract topics
        let topics: Vec<_> = metadata
            .topics()
            .into_iter()
            .map(|topic| {
                serde_json::json!({
                    "name": topic.name(),
                    "partitions": topic.partitions().len(),
                })
            })
            .collect();

        state.logger.info(LogObject {
            message: "Health check response".to_string(),
            data: Some(serde_json::json!({
                "kafka": {
                    "brokers": brokers,
                    "topics": topics,
                },
            })),
            ..Default::default()
        });
    } else {
        // Metadata is not available
        state.logger.info(LogObject {
            message: "Health check response".to_string(),
            data: Some(serde_json::json!({
                "kafka": null,
            })),
            ..Default::default()
        });
    }

    let response: HealthCheckResponse = HealthCheckResponse {
        message: "Saul Goodman",
        mysql: mysql_check.is_ok(),
        kafka: kafka_metadata.is_some(),
        environment: state.env.ENVIRONMENT.clone(),
        docs_url: format!("{}/docs/api", state.env.BASE_WEB_URL),
    };

    state.logger.info(LogObject {
        message: "Health check response".to_string(),
        data: Some(json!({
            "request_id": request_id,
            "response": &response,
        })),
        ..Default::default()
    });

    (StatusCode::OK, Json(response))
}
