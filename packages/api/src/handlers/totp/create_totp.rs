use super::TotpPost;
use crate::get_env;
use crate::MongoDB;
use axum::http::StatusCode;
use axum::Json;
use mongodb::Extension;
use std::sync::Arc;

pub async fn create_totp(mongodb: Extension<Arc<MongoDB>>) -> (StatusCode, Json<TotpPost>) {
    let response: TotpPost = TotpPost {
        message: "Saul Goodman",
        database: mongodb.collection.find_one(None, None).await.is_ok(),
        deployment_environment: get_env().NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT,
    };

    (StatusCode::OK, Json(response))
}
