CREATE TABLE IF NOT EXISTS internal_tasks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  type ENUM('send_welcome_email', 'poop') NOT NULL,
  data JSON NOT NULL,
  status ENUM('pending', 'processing', 'processed', 'error') NOT NULL DEFAULT 'pending',
  -- https://bugs.mysql.com/bug.php?id=103228
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
