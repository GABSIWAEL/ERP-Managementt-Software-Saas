-- Update asset status constraint to include DAMAGED and SOLD

-- Drop the old CHECK constraint
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_status_check;

-- Add the new CHECK constraint with all valid statuses
ALTER TABLE assets 
ADD CONSTRAINT assets_status_check 
CHECK (status IN ('AVAILABLE', 'ASSIGNED', 'RETURNED', 'DAMAGED', 'SOLD'));
