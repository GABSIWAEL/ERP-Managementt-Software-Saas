-- Initialize TechNova ERP Database
-- This script runs automatically when PostgreSQL container starts

-- Set up schema
CREATE SCHEMA IF NOT EXISTS erp_schema;

-- Create extensions (available in Alpine PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set search path
ALTER ROLE erp_user SET search_path TO erp_schema, public;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA erp_schema TO erp_user;
GRANT ALL PRIVILEGES ON DATABASE erp_system TO erp_user;

-- Create audit function (optional, for additional auditing)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Log initialized
SELECT 'TechNova ERP Database initialized successfully' as status;
