-- Migration: Fix warnings table schema and constraints
-- Purpose: Align database schema with current Warning entity enum values
-- Date: 2026-06-29

-- Drop old constraint if it exists
ALTER TABLE warnings DROP CONSTRAINT IF EXISTS warnings_status_check CASCADE;

-- Add new constraint with correct enum values
ALTER TABLE warnings 
ADD CONSTRAINT warnings_status_check 
CHECK (status IN ('PENDING_HR_REVIEW', 'RESOLVED', 'ESCALATED', 'REUNION_SCHEDULED', 'CLOSED'));

-- Drop old constraint for severity if it uses old enum values
ALTER TABLE warnings DROP CONSTRAINT IF EXISTS warnings_severity_check CASCADE;

-- Add new constraint with correct severity enum values
ALTER TABLE warnings 
ADD CONSTRAINT warnings_severity_check 
CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH'));

-- Ensure required columns are correctly defined
ALTER TABLE warnings 
ALTER COLUMN reason SET NOT NULL,
ALTER COLUMN severity SET NOT NULL,
ALTER COLUMN status SET NOT NULL,
ALTER COLUMN date_issued SET NOT NULL;

-- Log migration
SELECT 'Migration 11: Fixed warnings table schema and constraints' as migration_status;
