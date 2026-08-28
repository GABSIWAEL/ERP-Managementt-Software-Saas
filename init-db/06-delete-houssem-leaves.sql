-- Delete all leave requests for employee Houssem Gabsi

-- First, find the employee ID
-- SELECT id FROM employees WHERE first_name = 'Houssem' AND last_name = 'Gabsi';

-- Delete all leave requests for this employee
DELETE FROM leave_requests 
WHERE employee_id IN (
    SELECT id FROM employees 
    WHERE first_name = 'Houssem' AND last_name = 'Gabsi'
);

SELECT 'All leave requests for Houssem Gabsi have been deleted' AS result;
