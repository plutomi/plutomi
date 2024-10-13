use axum::{
    middleware,
    response::Redirect,
    routing::{get, post},
    Router,
};
use constants::{DOCS_ROUTES, PORT};
use controllers::{health_check, method_not_allowed, not_found, request_totp};
use rdkafka::{producer::FutureProducer, ClientConfig};
use serde_json::json;
use shared::{
    get_env::get_env,
    logger::{LogObject, Logger, LoggerContext},
};
use std::sync::Arc;
use structs::app_state::AppState;
use tower::ServiceBuilder;
use utils::{log_req_res::log_request, timeout::timeout};

mod constants;
mod controllers;
mod structs;
mod utils;

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    dotenvy::dotenv().ok();

    let env = get_env();

    let logger = Logger::init(LoggerContext { caller: "api" });

    // TODO: Redirect with a toast message
    let docs_redirect_url = format!("{}/docs/api?from=api", &env.BASE_WEB_URL);

    // For publishing
    let producer: FutureProducer = ClientConfig::new()
        .set("bootstrap.servers", &env.KAFKA_URL)
        .set("acks", "all")
        .set("retries", "10")
        .set("message.timeout.ms", "10000")
        .set("retry.backoff.ms", "500")
        .create()
        .map_err(|e| {
            let err = format!("Failed to create producer: {}", e);
            logger.error(LogObject {
                message: err.clone(),
                ..Default::default()
            });
            err
        })
        .unwrap_or_else(|e| {
            logger.error(LogObject {
                message: format!("Failed to create producer: {}", e),
                ..Default::default()
            });
            std::process::exit(1);
        });

    // Create an instance of AppState to be shared with all routes
    let state = Arc::new(AppState {
        logger: Arc::clone(&logger),
        env,
        producer: Arc::new(producer),
    });

    // Redirect to web app routes
    let docs_routes = DOCS_ROUTES.iter().fold(Router::new(), |router, route| {
        router.route(route, get(Redirect::temporary(&docs_redirect_url)))
    });

    let app = Router::new()
        // This is the internal kubernetes health check route
        .route("/health", get(health_check))
        // Public health check route
        .route("/api/health", get(health_check))
        // All of these should redirect to the web app
        .merge(docs_routes)
        .route("/api/totp", post(request_totp))
        .fallback(not_found)
        .layer(
            // Middleware that is applied to all routes
            ServiceBuilder::new()
                .layer(middleware::from_fn_with_state(
                    Arc::clone(&state),
                    log_request,
                ))
                .layer(middleware::from_fn_with_state(Arc::clone(&state), timeout))
                .layer(middleware::from_fn_with_state(
                    Arc::clone(&state),
                    method_not_allowed,
                )),
        )
        // Add app state like logger, DB connections, etc.
        .with_state(Arc::clone(&state));

    let addr = PORT.parse::<std::net::SocketAddr>().unwrap_or_else(|e| {
        let message = format!("Failed to parse address on startup '{}': {}", PORT, e);
        let error_json = json!({ "message": &message });
        logger.error(LogObject {
            message,
            data: Some(json!({ "port": PORT })),
            error: Some(error_json),
            ..Default::default()
        });
        std::process::exit(1);
    });

    // Bind listener
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .unwrap_or_else(|e| {
            let message = format!("Failed to bind to address on startup '{}': {}", addr, e);
            let error_json = json!({ "message": &message });
            logger.error(LogObject {
                message,
                data: Some(json!({ "addr": addr })),
                error: Some(error_json),
                ..Default::default()
            });
            std::process::exit(1);
        });

    // Start the server
    axum::serve(listener, app).await.unwrap_or_else(|e| {
        let message = format!("Failed to start server: {}", e);
        let error_json = json!({ "message": &message });
        logger.error(LogObject {
            message,
            data: None,
            error: Some(error_json),
            ..Default::default()
        });
        std::process::exit(1);
    });
}
