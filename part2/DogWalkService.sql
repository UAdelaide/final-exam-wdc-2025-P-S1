-- Create database
CREATE DATABASE IF NOT EXISTS DogWalkService;
USE DogWalkService;

-- Create Users 
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('owner', 'walker') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Dogs table
CREATE TABLE IF NOT EXISTS Dogs (
    dog_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    size ENUM('small', 'medium', 'large') NOT NULL,
    owner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES Users(user_id)
);

-- Create WalkRequests table
CREATE TABLE IF NOT EXISTS WalkRequests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    dog_id INT,
    requested_time DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    status ENUM('open', 'accepted', 'completed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dog_id) REFERENCES Dogs(dog_id)
);

-- Create WalkApplications table
CREATE TABLE IF NOT EXISTS WalkApplications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT,
    walker_id INT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
    FOREIGN KEY (walker_id) REFERENCES Users(user_id)
);

-- Insert sample users for testing website functionality
INSERT IGNORE INTO Users (username, email, password_hash, role) VALUES
('Jane Smith', 'owner.jane@email.com', 'password123', 'owner'),
('Mike Johnson', 'walker.mike@email.com', 'password123', 'walker'),
('Sarah Davis', 'walker.sarah@email.com', 'password123', 'walker'),
('Bob Wilson', 'owner.bob@email.com', 'password123', 'owner');

-- Insert sample dogs
INSERT IGNORE INTO Dogs (name, size, owner_id) VALUES
('Buddy', 'large', 1),
('Luna', 'medium', 1),
('Max', 'small', 4);

-- Insert sample walk requests
INSERT IGNORE INTO WalkRequests (dog_id, requested_time, duration_minutes, location) VALUES
(1, '2024-06-21 10:00:00', 30, 'Central Park'),
(2, '2024-06-21 14:00:00', 45, 'Riverside Park'),
(3, '2024-06-22 09:00:00', 20, 'Local Neighborhood');