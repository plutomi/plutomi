use axum::{
    middleware::{self},
    routing::{get, post},
    Router,
};
use controllers::{create_totp, health_check, method_not_allowed, not_found};
use dotenv::dotenv;
use serde_json::json;
use structs::app_state::AppState;
use time::OffsetDateTime;
use tower::ServiceBuilder;
use utils::{
    get_current_time::iso_format,
    get_env::get_env,
    log_req_res::log_req_res,
    logger::{LogLevel, LogObject, Logger},
    mongodb::connect_to_mongodb,
};

mod consts;
mod controllers;
mod entities;
mod structs;
mod utils;

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    // Get environment variables
    dotenv().ok(); // Load .env if available (used in development)
    let env = get_env();

    // Setup logging
    let logger = Logger::new(true);

    // Connect to database
    let mongodb = connect_to_mongodb(&logger).await;

    // Create an instance of AppState to be shared with all routes
    let state = AppState {
        logger: logger.clone(),
        mongodb,
        env,
    };

    // Routes
    let totp_routes = Router::new().route("/totp", post(create_totp));

    let app = Router::new().nest(
        "/api",
        Router::new()
            .merge(totp_routes)
            .route("/health", get(health_check))
            .fallback(not_found)
            .layer(
                // Middleware is applied top to bottom as long as its attached to this ServiceBuilder
                ServiceBuilder::new()
                    // log_req_res should be the first middleware *always* as it handles incoming
                    // and outgoing requests logging
                    .layer(middleware::from_fn_with_state(state.clone(), log_req_res))
                    .layer(middleware::from_fn_with_state(
                        state.clone(),
                        method_not_allowed,
                    )),
            )
            .with_state(state),
    );

    let port = "[::]:8080";
    // Bind address
    let addr = port.parse::<std::net::SocketAddr>().unwrap_or_else(|e| {
        let message = format!("Failed to parse address on startup '{}': {}", port, e);
        let error_json = json!({ "message": &message });
        logger.log(LogObject {
            level: LogLevel::Error,
            timestamp: iso_format(OffsetDateTime::now_utc()),
            message,
            data: Some(json!({ "port": port })),
            error: Some(error_json),
            request: None,
            response: None,
        });
        std::process::exit(1);
    });

    // Bind listener
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .unwrap_or_else(|e| {
            let message = format!("Failed to bind to address on startup '{}': {}", addr, e);
            let error_json = json!({ "message": &message });
            logger.log(LogObject {
                level: LogLevel::Error,
                timestamp: iso_format(OffsetDateTime::now_utc()),
                message,
                data: Some(json!({ "addr": addr })),
                error: Some(error_json),
                request: None,
                response: None,
            });
            std::process::exit(1);
        });

    // Start the server
    axum::serve(listener, app)
        .await
        .map(|_| {
            logger.log(LogObject {
                level: LogLevel::Info,
                timestamp: iso_format(OffsetDateTime::now_utc()),
                message: "Server started".to_string(),
                data: None,
                error: None,
                request: None,
                response: None,
            })
        })
        .unwrap_or_else(|e| {
            let logger = logger.clone();
            let message = format!("Server failed to start: {}", e);
            let error_json = json!({ "message": &message });
            logger.log(LogObject {
                level: LogLevel::Error,
                timestamp: iso_format(OffsetDateTime::now_utc()),
                message,
                data: None,
                error: Some(error_json),
                request: None,
                response: None,
            });
            std::process::exit(1);
        })
}
