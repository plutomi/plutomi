CREATE TABLE IF NOT EXISTS internal_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  type VARCHAR(15) NOT NULL,
  data JSON NULL,
  -- https://bugs.mysql.com/bug.php?id=103228
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
