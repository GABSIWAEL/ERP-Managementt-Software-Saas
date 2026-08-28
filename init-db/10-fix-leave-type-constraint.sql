-- Fix leave_requests_type_check constraint to include all leave types
-- Previous constraint only had limited types, this expands it

ALTER TABLE leave_requests DROP CONSTRAINT leave_requests_type_check;

ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_type_check 
  CHECK (type IN ('ANNUAL', 'SICK', 'CASUAL', 'UNPAID', 'MATERNITY', 'PATERNITY', 'STUDY', 'BEREAVEMENT'));

-- Log the migration
SELECT 'Migration 10: Fixed leave_requests_type_check constraint' as migration_status;
