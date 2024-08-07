use axum::{
    middleware,
    response::Redirect,
    routing::{get, post},
    Router,
};
use consts::{DOCS_ROUTES, PORT};
use controllers::{health_check, method_not_allowed, not_found, request_totp};
use dotenv::dotenv;
use serde_json::json;
use shared::{
    get_current_time::get_current_time,
    get_env::get_env,
    logger::{LogLevel, LogObject, Logger},
    mongodb::connect_to_mongodb,
};
use structs::app_state::AppState;
use time::OffsetDateTime;
use tower::ServiceBuilder;
use tracing::{info, warn};
use utils::{log_req_res::log_req_res, timeout::timeout};

mod consts;
mod controllers;
mod structs;
mod utils;

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    info!("API starting...");
    // Get environment variables
    dotenv().ok(); // Load .env if available (used in development)
    let env = get_env();

    info!("Environment variables loaded");
    // Setup logging
    let logger = Logger::new();
    info!("Logger initialized");

    // Connect to database - TODO update res/option
    let mongodb = connect_to_mongodb(&logger).await;
    info!("Connected to MongoDB");

    // TODO: Redirect with a toast message
    let docs_redirect_url = format!("{}/docs/api?from=api", &env.BASE_WEB_URL);

    // Create an instance of AppState to be shared with all routes
    let state = AppState {
        logger: logger.clone(),
        mongodb,
        env,
    };
    // Grouping of middleware that should be applied
    // Under a ServiceBuilder, it is applied from top to bottom
    let required_middleware = ServiceBuilder::new()
        .layer(middleware::from_fn_with_state(state.clone(), log_req_res))
        .layer(middleware::from_fn_with_state(state.clone(), timeout))
        .layer(middleware::from_fn_with_state(
            state.clone(),
            method_not_allowed,
        ));

    // Redirect to web app routes
    let docs_routes = DOCS_ROUTES.iter().fold(Router::new(), |router, route| {
        router.route(route, get(Redirect::temporary(&docs_redirect_url)))
    });

    // Combine all other routes under /api/* */
    let main_routes = Router::new()
        .route("/request-totp", post(request_totp))
        // Public health check route
        .route("/health", get(health_check));

    let app = Router::new()
        // These are applied backwards, so bottom to top gets precedence
        .fallback(not_found) //
        .nest("/api", main_routes) //  / ⬆️
        .merge(docs_routes) // redirect / ⬆️
        // This is the internal health check route, public health check goes to docs route
        // Or probably a status page in the future
        .route("/health", get(health_check)) // ⬆️
        .layer(required_middleware) // / ⬆️
        .with_state(state); //         / ⬆️

    // Bind address
    let addr = PORT.parse::<std::net::SocketAddr>().unwrap_or_else(|e| {
        let message = format!("Failed to parse address on startup '{}': {}", PORT, e);
        let error_json = json!({ "message": &message });
        logger.log(LogObject {
            level: LogLevel::Error,
            _time: get_current_time(OffsetDateTime::now_utc()),
            message,
            data: Some(json!({ "port": PORT })),
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
                _time: get_current_time(OffsetDateTime::now_utc()),
                message,
                data: Some(json!({ "addr": addr })),
                error: Some(error_json),
                request: None,
                response: None,
            });
            std::process::exit(1);
        });

    logger.log(LogObject {
        level: LogLevel::Info,
        _time: get_current_time(OffsetDateTime::now_utc()),
        message: "API starting on http://localhost:8080".to_string(),
        data: None,
        error: None,
        request: None,
        response: None,
    });

    // Start the server
    axum::serve(listener, app).await.unwrap_or_else(|e| {
        let logger = logger.clone();
        let message = format!("Server failed to start: {}", e);
        let error_json = json!({ "message": &message });
        logger.log(LogObject {
            level: LogLevel::Error,
            _time: get_current_time(OffsetDateTime::now_utc()),
            message,
            data: None,
            error: Some(error_json),
            request: None,
            response: None,
        });
        std::process::exit(1);
    })
}
