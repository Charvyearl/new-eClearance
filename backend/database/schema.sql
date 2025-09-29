-- Cashless Canteen Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS cashless_canteen;
USE cashless_canteen;

-- Users table (students, staff, admin)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rfid_card_id VARCHAR(50) UNIQUE NOT NULL,
    student_id VARCHAR(20) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    user_type ENUM('student', 'staff', 'admin') NOT NULL DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rfid (rfid_card_id),
    INDEX idx_student_id (student_id),
    INDEX idx_user_type (user_type)
);

-- Wallets table
CREATE TABLE wallets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Menu categories
CREATE TABLE menu_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- (Deprecated) menu_items table removed in favor of PRODUCT

-- Canonical products table for canteen staff flow
CREATE TABLE IF NOT EXISTS PRODUCT (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(8,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_name (product_name),
    INDEX idx_category (category),
    INDEX idx_available (is_available)
);

-- Transaction types
CREATE TABLE transaction_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Transactions table
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    transaction_type_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_id VARCHAR(100), -- For linking to orders, top-ups, etc.
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_type_id) REFERENCES transaction_types(id),
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('rfid', 'cash') DEFAULT 'rfid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_order_id (order_id),
    INDEX idx_status (status)
);

-- Order items
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(8,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
);

-- Reservations table
CREATE TABLE reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    reservation_date DATE NOT NULL,
    status ENUM('active', 'fulfilled', 'cancelled', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES PRODUCT(product_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_reservation_date (reservation_date),
    INDEX idx_status (status)
);

-- System settings
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default transaction types
INSERT INTO transaction_types (name, description) VALUES
('top_up', 'Money added to wallet'),
('purchase', 'Payment for food items'),
('refund', 'Refund for cancelled order'),
('adjustment', 'Manual balance adjustment');

-- Insert default menu categories
INSERT INTO menu_categories (name, description) VALUES
('Main Course', 'Rice, pasta, and main dishes'),
('Beverages', 'Drinks and refreshments'),
('Snacks', 'Light snacks and desserts'),
('Salads', 'Fresh salads and healthy options');

-- Students table
CREATE TABLE students (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    rfid_card_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rfid (rfid_card_id),
    INDEX idx_email (email)
);

-- Personnel table
CREATE TABLE personnel (
    personnel_id INT PRIMARY KEY AUTO_INCREMENT,
    rfid_card_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rfid (rfid_card_id),
    INDEX idx_email (email)
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('system_name', 'Cashless Canteen System', 'Name of the canteen system'),
('currency', 'PHP', 'Default currency'),
('min_balance', '0.00', 'Minimum wallet balance'),
('max_balance', '10000.00', 'Maximum wallet balance'),
('rfid_timeout', '30', 'RFID reader timeout in seconds');
