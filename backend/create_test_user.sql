-- Create a simple test user
DELETE FROM users WHERE email = 'test@test.com';

INSERT INTO users (name, email, password_hash, role) 
VALUES ('Test User', 'test@test.com', '$2b$10$sP/PviBZt9pRYcmWR6fMi.adx7RPtWix/mJYqtdM12/vr/shNTC/a', 'admin');

-- Also create admin user with same password
DELETE FROM users WHERE email = 'admin@eclearance.com';

INSERT INTO users (name, email, password_hash, role) 
VALUES ('System Administrator', 'admin@eclearance.com', '$2b$10$sP/PviBZt9pRYcmWR6fMi.adx7RPtWix/mJYqtdM12/vr/shNTC/a', 'admin');

-- Show all users
SELECT id, name, email, role FROM users;
