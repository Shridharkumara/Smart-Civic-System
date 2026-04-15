CREATE DATABASE IF NOT EXISTS smartcivic DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE smartcivic;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issues (
    issue_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(80) NOT NULL,
    image_path VARCHAR(300),
    image_data LONGTEXT,
    video_data LONGTEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'Pending',
    location VARCHAR(200),
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS votes (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    issue_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_vote (user_id, issue_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (issue_id) REFERENCES issues(issue_id) ON DELETE CASCADE
);

INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@smartcivic.com', SHA2('AdminPass123', 256), 'admin'),
('Anonymous Reporter', 'anonymous@smartcivic.com', SHA2('anonymous', 256), 'user');
