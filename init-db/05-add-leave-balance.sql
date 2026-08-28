-- Add leave balance columns to employees table
-- This migration adds fields to track employee leave balances

ALTER TABLE employees ADD COLUMN IF NOT EXISTS annual_leave_balance INT DEFAULT 20 NOT NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS sick_leave_balance INT DEFAULT 8 NOT NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS casual_leave_balance INT DEFAULT 5 NOT NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS maternity_leave_balance INT DEFAULT 180 NOT NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS paternity_leave_balance INT DEFAULT 10 NOT NULL;

-- Add comments to explain each field
COMMENT ON COLUMN employees.annual_leave_balance IS 'Number of annual leave days available to the employee';
COMMENT ON COLUMN employees.sick_leave_balance IS 'Number of sick leave days available to the employee';
COMMENT ON COLUMN employees.casual_leave_balance IS 'Number of casual leave days available to the employee';
COMMENT ON COLUMN employees.maternity_leave_balance IS 'Number of maternity leave days available to the employee';
COMMENT ON COLUMN employees.paternity_leave_balance IS 'Number of paternity leave days available to the employee';

-- Set all existing employees to have the default leave balances
UPDATE employees SET 
  annual_leave_balance = 20,
  sick_leave_balance = 8,
  casual_leave_balance = 5,
  maternity_leave_balance = 180,
  paternity_leave_balance = 10
WHERE annual_leave_balance IS NULL;

-- Create indexes for faster leave request queries
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_type_status ON leave_requests(type, status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);

SELECT 'Leave balance columns and indexes successfully added' AS migration_status;
