-- Fix type column to allow NULL
ALTER TABLE assets ALTER COLUMN type DROP NOT NULL;
