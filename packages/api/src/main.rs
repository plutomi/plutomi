use axum::{routing::get, Router};

pub mod utils;
use crate::utils::ksuid::{KsuidMs, KsuidLike};


use std::time::{SystemTime, UNIX_EPOCH};
use time::{Duration, OffsetDateTime};

#[derive(Debug)]
enum Entities {
    Org,
}

impl Entities {
    fn to_lowercase(&self) -> String {
        format!("{:?}", self).to_lowercase()
    }
}
fn current_time() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_millis() as i64
}

fn create_plutomi_id(entity: Entities, timestamp_ms: Option<i64>) -> String {
    let timestamp_ms = match timestamp_ms {
        Some(timestamp_ms) => timestamp_ms,
        None => current_time(),
    };

    let timestamp_seconds = timestamp_ms / 1000; // Convert milliseconds to seconds
    let additional_nanos = (timestamp_ms % 1000) * 1_000_000; // Convert the remainder to nanoseconds

    let timestamp = OffsetDateTime::from_unix_timestamp(timestamp_seconds as i64)
        .expect("Invalid timestamp")
        + Duration::nanoseconds(additional_nanos as i64);

    format!(
        "{}_{}",
        entity.to_lowercase(),
        KsuidMs::new(Some(timestamp), None)
    )
}




#[tokio::main]
async fn main() {
    let app = Router::new().route("/ssr", get(|| async { 
        
        // let x = create_plutomi_id(Entities::Org, None);
        // "Hello from rust!"

        let y = KsuidMs::new(None, None);

    // for i in 0..1000000 {
    //     let y = KsuidMs::new(None, None);
    //     println!("Hello from rust 2! {} {}", y, y.timestamp());
    //  }
    
    
        // Return hello from rust and x concatenated
        format!("Hello from rust 2:D")
    }
    ));

    axum::Server::bind(&"0.0.0.0:8080".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
