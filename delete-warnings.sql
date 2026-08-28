-- Delete all warnings from the database
DELETE FROM warnings;

-- Reset the sequence for the warnings table (if using auto-increment)
ALTER SEQUENCE warnings_id_seq RESTART WITH 1;

SELECT 'All warnings deleted successfully' as result;
SELECT COUNT(*) as remaining_warnings FROM warnings;
