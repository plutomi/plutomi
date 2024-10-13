use tokio::time::{sleep, Duration};

/**
 * For the migrator, it exits too quick so give it a sec to log stuff out
 */
pub async fn sleep_and_exit(seconds: u64) -> ! {
    sleep(Duration::from_secs(seconds)).await;
    std::process::exit(1);
}
