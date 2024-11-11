use axum::{
    middleware,
    response::Redirect,
    routing::{get, post},
    Router,
};
use constants::{DOCS_ROUTES, PORT};
use controllers::{health_check, method_not_allowed, not_found, post_users};
use serde_json::json;
use shared::{
    get_env::get_env,
    kafka::KafkaClient,
    logger::{LogObject, Logger, LoggerContext},
    mysql::MySQLClient,
};
use std::sync::Arc;
use structs::app_state::AppState;
use tower::ServiceBuilder;
use utils::{log_req_res::log_request, timeout::timeout};

mod constants;
mod controllers;
mod handlers;
mod structs;
mod utils;

#[tokio::main(flavor = "multi_thread")]
async fn main() -> Result<(), String> {
    println!("Getting environment variables INIT!!");

    let envx = dotenvy::dotenv();

    if envx.is_err() {
        println!("Failed to load .env file");
    }

    println!("Getting environment variables!");

    let env = get_env();

    println!("GOT environment variables! Getting logger");
    let logger = Logger::init(LoggerContext { application: "api" })?;
    println!("GOTlogger! getting kafka client...");

    // TODO: Redirect with a toast message
    let docs_redirect_url = format!("{}/docs/api?from=api", &env.BASE_WEB_URL);

    let kafka = KafkaClient::new("api", &Arc::clone(&logger), false, None, None);
    println!("GOT KAFKA CLIENT! Getting mysql!");

    let mysql = MySQLClient::new("api", &logger, None).await?;
    println!("GOT mysql!! Getting state...");

    // Create an instance of AppState to be shared with all routes
    let state = Arc::new(AppState {
        logger: Arc::clone(&logger),
        env,
        mysql,
        kafka,
    });
    println!("GOT state! Getting routes...");

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
        .route("/api/users", post(post_users))
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

    println!("GOT routes! Starting server...");
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
            error: Some(error_json),
            ..Default::default()
        });
        std::process::exit(1);
    });

    Ok(())
}
