CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  email VARCHAR(254) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  public_id VARCHAR(12) NOT NULL,
  -- https://bugs.mysql.com/bug.php?id=103228
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,

  UNIQUE KEY `idx_public_id` (`public_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
