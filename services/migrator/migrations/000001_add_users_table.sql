CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  email VARCHAR(255) NOT NULL,
  -- https://bugs.mysql.com/bug.php?id=103228
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
