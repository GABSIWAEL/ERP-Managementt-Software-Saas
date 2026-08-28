-- Migration: Add workflow columns to warnings table
-- Purpose: Support HR warning workflow (reunions, reports, escalations)
-- Date: 2024

ALTER TABLE warnings ADD COLUMN hr_comment VARCHAR(1000) NULL AFTER status;
ALTER TABLE warnings ADD COLUMN reunion_scheduled_at DATETIME NULL AFTER hr_comment;
ALTER TABLE warnings ADD COLUMN reunion_report VARCHAR(2000) NULL AFTER reunion_scheduled_at;
ALTER TABLE warnings ADD COLUMN resolved_at DATETIME NULL AFTER reunion_report;

-- Add index for workflow queries
CREATE INDEX idx_warnings_status ON warnings(status);
CREATE INDEX idx_warnings_resolved_at ON warnings(resolved_at);
