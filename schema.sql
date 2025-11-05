-- Gamified Club Management System Schema
-- DB Engine: InnoDB
-- Character Set: utf8mb4
-- Collation: utf8mb4_unicode_ci

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS clubsun_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clubsun_db;

-- Drop tables if they exist to ensure a clean slate
DROP TABLE IF EXISTS `settings`, `notifications`, `activity_log`, `login_sessions`, `club_badges`, `user_badges`, `badges`, `club_members`, `clubs`, `users`;

-- 1. users table
CREATE TABLE `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('student','admin') NOT NULL,
  `total_points` INT DEFAULT 0,
  `badge` ENUM('none','bronze','silver','gold') DEFAULT 'none',
  `date_joined` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. clubs table
CREATE TABLE `clubs` (
  `club_id` INT AUTO_INCREMENT PRIMARY KEY,
  `club_name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `capacity` INT DEFAULT 30,
  `current_members` INT DEFAULT 0,
  `total_points` INT DEFAULT 0,
  `badge` ENUM('none','iron','bronze','silver','gold','platinum') DEFAULT 'none',
  `created_by` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. club_members table
CREATE TABLE `club_members` (
  `membership_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `club_id` INT,
  `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `points_earned` INT DEFAULT 10,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`club_id`) REFERENCES `clubs`(`club_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. badges table
CREATE TABLE `badges` (
  `badge_id` INT AUTO_INCREMENT PRIMARY KEY,
  `badge_name` VARCHAR(100) NOT NULL,
  `badge_type` ENUM('student','club') NOT NULL,
  `description` TEXT,
  `points_required` INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. user_badges table
CREATE TABLE `user_badges` (
  `user_badge_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `badge_id` INT,
  `awarded_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`badge_id`) REFERENCES `badges`(`badge_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. club_badges table
CREATE TABLE `club_badges` (
  `club_badge_id` INT AUTO_INCREMENT PRIMARY KEY,
  `club_id` INT,
  `badge_name` ENUM('iron','bronze','silver','gold','platinum') NOT NULL,
  `awarded_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`club_id`) REFERENCES `clubs`(`club_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. login_sessions table
CREATE TABLE `login_sessions` (
  `session_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `session_token` VARCHAR(255) NOT NULL UNIQUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. activity_log table
CREATE TABLE `activity_log` (
  `log_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `action` VARCHAR(255) NOT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. notifications table
CREATE TABLE `notifications` (
  `notification_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `message` TEXT NOT NULL,
  `is_read` BOOLEAN DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. settings table
CREATE TABLE `settings` (
  `setting_id` INT AUTO_INCREMENT PRIMARY KEY,
  `key_name` VARCHAR(100) NOT NULL UNIQUE,
  `key_value` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert initial data

-- Insert admin user
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('Admin', 'admin@sunway.edu.my', 'admin123', 'admin');

-- Insert 100 student users
DELIMITER $$
CREATE PROCEDURE InsertStudents()
BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i <= 100 DO
        INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
        (CONCAT('Student', i), CONCAT('student', i, '@sunway.edu.my'), 'password123', 'student');
        SET i = i + 1;
    END WHILE;
END$$
DELIMITER ;
CALL InsertStudents();
DROP PROCEDURE InsertStudents;

-- Insert 10 clubs
INSERT INTO `clubs` (`club_name`, `description`, `created_by`) VALUES
('Chess Club', 'A club for chess enthusiasts.', 1),
('Debate Club', 'A club for those who love to argue.', 1),
('Coding Club', 'A club for programmers.', 1),
('Music Club', 'A club for musicians.', 1),
('Art Club', 'A club for artists.', 1),
('Drama Club', 'A club for actors.', 1),
('Sports Club', 'A club for athletes.', 1),
('Gaming Club', 'A club for gamers.', 1),
('Science Club', 'A club for science lovers.', 1),
('Literature Club', 'A club for bookworms.', 1);

-- Insert student badges
INSERT INTO `badges` (`badge_name`, `badge_type`, `description`, `points_required`) VALUES
('Bronze', 'student', 'Awarded for reaching 20 points.', 20),
('Silver', 'student', 'Awarded for reaching 40 points.', 40),
('Gold', 'student', 'Awarded for reaching 60 points.', 60);

-- Insert club badges
INSERT INTO `badges` (`badge_name`, `badge_type`, `description`, `points_required`) VALUES
('Iron', 'club', 'Awarded for reaching 100 points.', 100),
('Bronze', 'club', 'Awarded for reaching 300 points.', 300),
('Silver', 'club', 'Awarded for reaching 700 points.', 700),
('Gold', 'club', 'Awarded for reaching 1200 points.', 1200),
('Platinum', 'club', 'Awarded for reaching 2000 points.', 2000);
