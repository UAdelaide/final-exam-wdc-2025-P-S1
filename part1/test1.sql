-- ==========================================
-- SQL INSERT Statements for Dog Walking Service
-- ==========================================

-- Insert Users (5 total: 3 specified + 2 custom)
-- ==========================================

-- Required users
INSERT INTO Users (username, email, password_hash, role)
VALUES ('alice123', 'alice@example.com', 'hashed123', 'owner');

INSERT INTO Users (username, email, password_hash, role)
VALUES ('bobwalker', 'bob@example.com', 'hashed456', 'walker');

INSERT INTO Users (username, email, password_hash, role)
VALUES ('carol123', 'carol@example.com', 'hashed789', 'owner');

-- Additional users (custom choices)
INSERT INTO Users (username, email, password_hash, role)
VALUES ('tom123', 'tom@example.com', 'hashed321', 'walker');

INSERT INTO Users (username, email, password_hash, role)
VALUES ('rachel123', 'rachel@example.com', 'hashed654', 'owner');


-- Insert Dogs (5 total: 2 specified + 3 custom)
-- ==========================================

-- Required dogs (using subqueries to find owner_id)
INSERT INTO Dogs (name, size, owner_id)
VALUES ('Max', 'medium',
    (SELECT user_id FROM Users WHERE username = 'alice123'));

INSERT INTO Dogs (name, size, owner_id)
VALUES ('Bella', 'small',
    (SELECT user_id FROM Users WHERE username = 'carol123'));

-- Additional dogs (custom choices)
INSERT INTO Dogs (name, size, owner_id)
VALUES ('ben', 'large',
    (SELECT user_id FROM Users WHERE username = 'tom123'));

INSERT INTO Dogs (name, size, owner_id)
VALUES ('Harry', 'small',
    (SELECT user_id FROM Users WHERE username = 'alice123'));

INSERT INTO Dogs (name, size, owner_id)
VALUES ('Simon', 'medium',
    (SELECT user_id FROM Users WHERE username = 'rachel123'));


-- Insert Walk Requests (5 total: 2 specified + 3 custom)
-- ==========================================

-- Required walk requests (using subqueries to find dog_id)
INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
VALUES ((SELECT dog_id FROM Dogs WHERE name = 'Max'),
        '2025-06-10 08:00:00', 30, 'Parklands', 'open');

INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
VALUES ((SELECT dog_id FROM Dogs WHERE name = 'Bella'),
        '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted');

-- Additional walk requests (custom choices)
INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
VALUES ((SELECT dog_id FROM Dogs WHERE name = 'Rocky'),
        '2025-06-11 07:00:00', 60, 'City Park', 'open');

INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
VALUES ((SELECT dog_id FROM Dogs WHERE name = 'Luna'),
        '2025-06-11 15:30:00', 25, 'River Walk', 'completed');

INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
VALUES ((SELECT dog_id FROM Dogs WHERE name = 'Charlie'),
        '2025-06-12 16:00:00', 40, 'Dog Beach', 'cancelled');


-- ==========================================
-- Verification Queries (Optional - for testing)
-- ==========================================

-- View all data with relationships
SELECT
    u.username as owner_name,
    d.name as dog_name,
    d.size,
    wr.requested_time,
    wr.duration_minutes,
    wr.location,
    wr.status
FROM Users u
JOIN Dogs d ON u.user_id = d.owner_id
LEFT JOIN WalkRequests wr ON d.dog_id = wr.dog_id
ORDER BY u.username, d.name, wr.requested_time;