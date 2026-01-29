-- Run this in phpMyAdmin to add the delivery_option column to existing orders table
ALTER TABLE orders ADD COLUMN delivery_option VARCHAR(20) DEFAULT 'pickup' AFTER total_amount;
