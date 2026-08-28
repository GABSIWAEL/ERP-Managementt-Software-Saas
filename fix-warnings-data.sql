-- First, check what's currently in the warnings table
SELECT id, status, severity FROM warnings;

-- Update any invalid status values
UPDATE warnings SET status = 'PENDING_HR_REVIEW' 
WHERE status NOT IN ('PENDING_HR_REVIEW', 'RESOLVED', 'ESCALATED', 'REUNION_SCHEDULED', 'CLOSED');

-- Update any invalid severity values
UPDATE warnings SET severity = 'LOW' 
WHERE severity NOT IN ('LOW', 'MEDIUM', 'HIGH');

-- Verify updates
SELECT 'Warnings data updated successfully' as result;
SELECT id, status, severity FROM warnings;
