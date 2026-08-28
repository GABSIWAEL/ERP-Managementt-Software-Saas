-- Fix constraints for warnings table
ALTER TABLE warnings DROP CONSTRAINT IF EXISTS warnings_status_check CASCADE;
ALTER TABLE warnings DROP CONSTRAINT IF EXISTS warnings_severity_check CASCADE;

ALTER TABLE warnings 
ADD CONSTRAINT warnings_status_check 
CHECK (status IN ('PENDING_HR_REVIEW', 'RESOLVED', 'ESCALATED', 'REUNION_SCHEDULED', 'CLOSED'));

ALTER TABLE warnings 
ADD CONSTRAINT warnings_severity_check 
CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH'));

SELECT 'Constraints fixed successfully' as result;
