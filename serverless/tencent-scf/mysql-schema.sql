-- Run once with a migration account on TencentDB MySQL 8, not the web application's account.
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) CHARACTER SET ascii PRIMARY KEY,
  email VARCHAR(180) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL UNIQUE,
  password_hash VARCHAR(255) CHARACTER SET ascii NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  disabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sessions (
  token_hash CHAR(64) CHARACTER SET ascii PRIMARY KEY,
  user_id CHAR(36) CHARACTER SET ascii NOT NULL,
  expires_at BIGINT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX sessions_expiry (expires_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS submissions (
  id CHAR(36) CHARACTER SET ascii PRIMARY KEY,
  user_id CHAR(36) CHARACTER SET ascii NOT NULL,
  title VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  level VARCHAR(40) NOT NULL,
  description TEXT NOT NULL,
  source TEXT NOT NULL,
  object_key VARCHAR(160) CHARACTER SET ascii NOT NULL UNIQUE,
  file_name VARCHAR(180) NOT NULL,
  file_size INT UNSIGNED NOT NULL,
  status ENUM('uploading','pending','reviewed') NOT NULL DEFAULT 'uploading',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX submissions_user (user_id),
  INDEX submissions_order (created_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket CHAR(64) CHARACTER SET ascii PRIMARY KEY,
  hits INT UNSIGNED NOT NULL,
  expires_at BIGINT NOT NULL,
  INDEX rate_expiry (expires_at)
) ENGINE=InnoDB;
