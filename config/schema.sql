-- ==============================================
-- The Cyber Wings - Database Schema
-- Run this file to set up your MySQL database
-- ==============================================

CREATE DATABASE IF NOT EXISTS cyberwings_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cyberwings_db;

-- --------------------------------------------------
-- Members Table
-- Stores all registered club members
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS members (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  fullname     VARCHAR(100)  NOT NULL,
  email        VARCHAR(150)  NOT NULL UNIQUE,
  student_id   VARCHAR(50)   NOT NULL UNIQUE,
  academic_year ENUM('Freshman','Sophomore','Junior','Senior','Graduate') NOT NULL,
  major        VARCHAR(100)  NOT NULL,
  experience   ENUM('Beginner','Intermediate','Advanced','Expert') DEFAULT 'Beginner',
  interests    TEXT,
  motivation   TEXT,
  photo        VARCHAR(255)  DEFAULT NULL,
  role         ENUM('Member','Security Researcher','Technical Lead','Events Coordinator','Vice President','President') DEFAULT 'Member',
  is_leadership TINYINT(1)   DEFAULT 0,
  status       ENUM('pending','active','inactive') DEFAULT 'active',
  joined_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------
-- Events Table
-- Stores club events and activities
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  category    ENUM('workshops','competitions','meetups','other') DEFAULT 'other',
  description TEXT,
  location    VARCHAR(200),
  event_date  DATE         NOT NULL,
  image       VARCHAR(255) DEFAULT NULL,
  is_featured TINYINT(1)   DEFAULT 0,
  status      ENUM('upcoming','ongoing','completed','cancelled') DEFAULT 'upcoming',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------
-- Contact Messages Table
-- Stores messages submitted via contact form
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  subject    VARCHAR(200),
  message    TEXT         NOT NULL,
  ip_address VARCHAR(45),
  is_read    TINYINT(1)   DEFAULT 0,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------
-- Speaker Applications Table
-- Stores "as a speaker" form submissions
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS speaker_applications (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  fullname     VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL,
  organization VARCHAR(150),
  topic        VARCHAR(200) NOT NULL,
  bio          TEXT,
  experience   TEXT,
  proposed_date DATE,
  status       ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------
-- Seed: Sample Leadership Members
-- --------------------------------------------------
INSERT IGNORE INTO members
  (fullname, email, student_id, academic_year, major, experience, role, is_leadership)
VALUES
  ('Alex Johnson',  'alex@cyberwings.edu',  'STU001', 'Senior',    'Computer Science',      'Expert',       'President',        1),
  ('Sarah Chen',    'sarah@cyberwings.edu', 'STU002', 'Junior',    'Information Security',  'Advanced',     'Vice President',   1),
  ('Priya Patel',   'priya@cyberwings.edu', 'STU003', 'Sophomore', 'Computer Engineering',  'Intermediate', 'Events Coordinator', 1),
  ('Marcus Taylor', 'marcus@cyberwings.edu','STU004', 'Senior',    'Cybersecurity',         'Expert',       'Technical Lead',   1),
  ('David Kim',     'david@cyberwings.edu', 'STU005', 'Junior',    'Network Engineering',   'Advanced',     'Security Researcher', 0);

-- --------------------------------------------------
-- Seed: Sample Events
-- --------------------------------------------------
INSERT IGNORE INTO events
  (title, category, description, location, event_date, is_featured, status)
VALUES
  ('Web Application Security Workshop', 'workshops',    'Hands-on workshop covering OWASP Top 10 vulnerabilities and secure coding practices.', 'CS Building, Room 305',       '2023-10-15', 1, 'completed'),
  ('Capture The Flag Competition',       'competitions', 'Team-based CTF competition with challenges covering web security, forensics, and cryptography.', 'Virtual (Discord)', '2023-11-05', 1, 'completed'),
  ('Network Security Fundamentals',      'workshops',    'Introduction to network protocols, packet analysis, and intrusion detection systems.', 'Tech Center, Room 201',        '2023-12-01', 0, 'completed'),
  ('Spring Security Symposium',          'meetups',      'Annual gathering featuring talks from industry professionals and alumni.', 'Main Auditorium',                             '2024-03-20', 1, 'completed'),
  ('Ethical Hacking Bootcamp',           'workshops',    'Intensive weekend bootcamp on penetration testing methodologies.', 'CS Building, Lab 1',                                '2024-04-10', 1, 'upcoming');

-- --------------------------------------------------
-- Event Photos Table
-- Stores multiple gallery photos for completed events
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS event_photos (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  event_id   INT NOT NULL,
  photo      VARCHAR(255) NOT NULL,
  caption    VARCHAR(255) DEFAULT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- --------------------------------------------------
-- Admin Users table (optional — for future multi-admin)
-- Default credentials are in .env for simplicity
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
