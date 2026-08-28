-- ============================================================================
-- ERP System Test Data Initialization
-- This SQL file creates realistic test data for the ERP system
-- Automatically executed on application startup if spring.jpa.hibernate.ddl-auto=create-drop
-- ============================================================================

-- ============================================================================
-- Function: Generate BCrypt hash for passwords (pseudo - adjust as needed)
-- Passwords will be created via Java PasswordEncoder in DataInitializer
-- ============================================================================

-- Inserting Departments
INSERT INTO department (id, name, description, created_date, last_modified_date, created_by, last_modified_by) VALUES
(1, 'Human Resources', 'HR Department - Employee Management and Recruitment', NOW(), NOW(), 'admin', 'admin'),
(2, 'Accounting', 'Finance and Accounting Department', NOW(), NOW(), 'admin', 'admin'),
(3, 'Information Technology', 'IT Department - Software Development and Infrastructure', NOW(), NOW(), 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Inserting Employees
INSERT INTO employee (id, first_name, last_name, email, phone, department_id, job_title, salary, join_date, status, created_date, last_modified_date, created_by, last_modified_by) VALUES
(1, 'Jane', 'Doe', 'jane.doe@company.com', '+1234567890', 1, 'HR Manager', 75000, '2023-06-01', 'ACTIVE', NOW(), NOW(), 'admin', 'admin'),
(2, 'John', 'Smith', 'john.smith@company.com', '+1234567891', 3, 'Senior Developer', 85000, '2024-01-15', 'ACTIVE', NOW(), NOW(), 'admin', 'admin'),
(3, 'Mike', 'Johnson', 'mike.johnson@company.com', '+1234567892', 3, 'Junior Developer', 55000, '2024-02-20', 'ACTIVE', NOW(), NOW(), 'admin', 'admin'),
(4, 'Sarah', 'Williams', 'sarah.williams@company.com', '+1234567893', 2, 'Finance Manager', 80000, '2023-09-01', 'ACTIVE', NOW(), NOW(), 'admin', 'admin'),
(5, 'Robert', 'Brown', 'robert.brown@company.com', '+1234567894', 2, 'Accountant', 65000, '2024-03-10', 'ACTIVE', NOW(), NOW(), 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Inserting Attendance Records (March 2026 - 1 month of data)
INSERT INTO attendance (id, employee_id, date, check_in_time, check_out_time, hours_worked, status, created_date, last_modified_date, created_by, last_modified_by) VALUES
(1, 1, '2026-03-01', '09:00:00', '17:30:00', 8.5, 'PRESENT', NOW(), NOW(), 'admin', 'admin'),
(2, 1, '2026-03-02', '09:15:00', '17:30:00', 8.25, 'PRESENT', NOW(), NOW(), 'admin', 'admin'),
(3, 1, '2026-03-03', '09:00:00', '17:30:00', 8.5, 'PRESENT', NOW(), NOW(), 'admin', 'admin'),
(4, 2, '2026-03-01', '09:30:00', '18:00:00', 8.5, 'PRESENT', NOW(), NOW(), 'admin', 'admin'),
(5, 2, '2026-03-02', '09:00:00', '17:30:00', 8.5, 'PRESENT', NOW(), NOW(), 'admin', 'admin'),
(6, 2, '2026-03-03', NULL, NULL, 0, 'ABSENT', NOW(), NOW(), 'admin', 'admin'),
(7, 3, '2026-03-01', '09:00:00', '17:30:00', 8.5, 'PRESENT', NOW(), NOW(), 'admin', 'admin'),
(8, 3, '2026-03-02', '09:00:00', '17:30:00', 8.5, 'PRESENT', NOW(), NOW(), 'admin', 'admin'),
(9, 4, '2026-03-01', '08:45:00', '17:30:00', 8.75, 'PRESENT', NOW(), NOW(), 'admin', 'admin'),
(10, 5, '2026-03-01', '09:00:00', '17:30:00', 8.5, 'PRESENT', NOW(), NOW(), 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Inserting Leave Requests
INSERT INTO leave_request (id, employee_id, leave_type, start_date, end_date, leave_days, reason, status, approver_id, approval_date, created_date, last_modified_date, created_by, last_modified_by) VALUES
(1, 2, 'CASUAL', '2026-03-15', '2026-03-17', 3, 'Personal matter', 'APPROVED', 1, '2026-03-04', NOW(), NOW(), 'admin', 'admin'),
(2, 3, 'CASUAL', '2026-03-20', '2026-03-22', 3, 'Medical appointment', 'PENDING', NULL, NULL, NOW(), NOW(), 'admin', 'admin'),
(3, 5, 'MEDICAL', '2026-03-25', '2026-03-27', 3, 'Doctor recommended rest', 'APPROVED', 4, '2026-03-05', NOW(), NOW(), 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Inserting Assets
INSERT INTO asset (id, asset_name, asset_code, description, acquisition_date, value, status, created_date, last_modified_date, created_by, last_modified_by) VALUES
(1, 'Dell Laptop', 'LAP-001', 'Dell XPS 15 - Developer Laptop', '2024-01-10', 1500, 'ACTIVE', NOW(), NOW(), 'admin', 'admin'),
(2, 'Monitor', 'MON-001', 'Dell 27-inch 4K Monitor', '2024-01-10', 500, 'ACTIVE', NOW(), NOW(), 'admin', 'admin'),
(3, 'HP Printer', 'PRT-001', 'HP LaserJet Pro Printer', '2023-09-01', 800, 'ACTIVE', NOW(), NOW(), 'admin', 'admin'),
(4, 'Office Chair', 'CHR-001', 'Ergonomic Office Chair', '2023-06-01', 400, 'ACTIVE', NOW(), NOW(), 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Inserting Asset Assignments
INSERT INTO asset_assignment (id, asset_id, employee_id, assignment_date, return_date, status, created_date, last_modified_date, created_by, last_modified_by) VALUES
(1, 1, 2, '2024-01-10', NULL, 'ASSIGNED', NOW(), NOW(), 'admin', 'admin'),
(2, 2, 2, '2024-01-10', NULL, 'ASSIGNED', NOW(), NOW(), 'admin', 'admin'),
(3, 3, 1, '2023-09-01', NULL, 'ASSIGNED', NOW(), NOW(), 'admin', 'admin'),
(4, 4, 3, '2023-06-01', NULL, 'ASSIGNED', NOW(), NOW(), 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Inserting Events
INSERT INTO event (id, event_name, event_type, event_date, description, location, created_date, last_modified_date, created_by, last_modified_by) VALUES
(1, 'Company Annual Meeting', 'MEETING', '2026-03-15', 'Annual company review and planning session', 'Conference Room A', NOW(), NOW(), 'admin', 'admin'),
(2, 'Team Building Activity', 'TEAM_BUILDING', '2026-03-20', 'Outdoor team building and lunch', 'Park Area', NOW(), NOW(), 'admin', 'admin'),
(3, 'Birthday Celebration', 'BIRTHDAY', '2026-03-10', 'Birthday celebration for the IT team', 'Office Cafeteria', NOW(), NOW(), 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Inserting Holidays
INSERT INTO holiday (id, holiday_name, holiday_date, description, is_recurring, created_date, last_modified_date, created_by, last_modified_by) VALUES
(1, 'New Year Day', '2026-01-01', 'National Holiday', true, NOW(), NOW(), 'admin', 'admin'),
(2, 'International Women Day', '2026-03-08', 'Celebration Day', true, NOW(), NOW(), 'admin', 'admin'),
(3, 'Company Foundation Day', '2026-05-01', 'Company Anniversary', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Inserting Remote Work Requests
INSERT INTO remote_work (id, employee_id, start_date, end_date, reason, status, approver_id, approval_date, created_date, last_modified_date, created_by, last_modified_by) VALUES
(1, 2, '2026-03-09', '2026-03-13', 'Working on critical project', 'APPROVED', 1, '2026-03-05', NOW(), NOW(), 'admin', 'admin'),
(2, 3, '2026-03-16', '2026-03-20', 'Home setup maintenance required', 'PENDING', NULL, NULL, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Inserting Performance Evaluations
INSERT INTO performance (id, employee_id, evaluator_id, evaluation_date, rating, comments, created_date, last_modified_date, created_by, last_modified_by) VALUES
(1, 2, 1, '2026-02-01', 4.5, 'Excellent performance. Strong technical skills and team collaboration.', NOW(), NOW(), 'admin', 'admin'),
(2, 3, 1, '2026-02-01', 3.8, 'Good performance. Needs improvement in documentation practices.', NOW(), NOW(), 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Inserting Payroll Records
INSERT INTO payroll (id, employee_id, month, year, basic_salary, allowances, deductions, net_salary, status, created_date, last_modified_date, created_by, last_modified_by) VALUES
(1, 1, 3, 2026, 75000, 5000, 2000, 78000, 'LOCKED', NOW(), NOW(), 'admin', 'admin'),
(2, 2, 3, 2026, 85000, 5000, 2500, 87500, 'LOCKED', NOW(), NOW(), 'admin', 'admin'),
(3, 3, 3, 2026, 55000, 3000, 1500, 56500, 'LOCKED', NOW(), NOW(), 'admin', 'admin'),
(4, 4, 3, 2026, 80000, 5000, 2000, 83000, 'LOCKED', NOW(), NOW(), 'admin', 'admin'),
(5, 5, 3, 2026, 65000, 3500, 1800, 66700, 'LOCKED', NOW(), NOW(), 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Inserting Recruitment Candidates
INSERT INTO candidate (id, candidate_name, email, phone, position, status, applied_date, created_date, last_modified_date, created_by, last_modified_by) VALUES
(1, 'Alice Cooper', 'alice.cooper@mail.com', '+1234567895', 'Software Developer', 'INTERVIEW', '2026-02-15', NOW(), NOW(), 'admin', 'admin'),
(2, 'Bob Wilson', 'bob.wilson@mail.com', '+1234567896', 'Junior Developer', 'PENDING_REVIEW', '2026-02-20', NOW(), NOW(), 'admin', 'admin'),
(3, 'Carol Martinez', 'carol.martinez@mail.com', '+1234567897', 'HR Executive', 'REJECTED', '2026-02-10', NOW(), NOW(), 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Inserting Warnings
INSERT INTO warnings (id, employee_id, reason, comments, severity, date_issued, status, hr_comment, reunion_scheduled_at, reunion_report, resolved_at, created_at, updated_at) VALUES
(1, 3, 'Late attendance 3 times in February', 'Employee needs to improve punctuality', 'LOW', '2026-02-15', 'PENDING_HR_REVIEW', NULL, NULL, NULL, NULL, NOW(), NOW()),
(2, 2, 'Incomplete project deliverables', 'Several tasks were not completed on time', 'MEDIUM', '2026-03-01', 'RESOLVED', 'Discussed with employee, improvement plan created', NULL, NULL, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserting Accounting Parameters
INSERT INTO accounting_parameter (id, parameter_code, parameter_value, created_date, last_modified_date, created_by, last_modified_by) VALUES
(1, 'TAX_RATE', '15.5', NOW(), NOW(), 'admin', 'admin'),
(2, 'PF_CONTRIBUTION', '12.0', NOW(), NOW(), 'admin', 'admin'),
(3, 'GRATUITY_MONTHS', '15', NOW(), NOW(), 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Inserting Accounting Parameter Versions (for auditing)
INSERT INTO accounting_parameter_version (id, parameter_id, old_value, new_value, change_date, changed_by, created_date) VALUES
(1, 1, '15.0', '15.5', NOW(), 'admin', NOW()),
(2, 2, '11.8', '12.0', NOW(), 'admin', NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserting Employee Exit Records
INSERT INTO employee_exit (id, employee_id, resignation_date, last_working_day, reason, status, created_date, last_modified_date, created_by, last_modified_by) VALUES
(1, 99, '2026-02-01', '2026-03-15', 'Better opportunity', 'APPROVED', NOW(), NOW(), 'admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_employee_department ON employee(department_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_leave_request_employee ON leave_request(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_request_status ON leave_request(status);
CREATE INDEX IF NOT EXISTS idx_asset_assignment_employee ON asset_assignment(employee_id);
CREATE INDEX IF NOT EXISTS idx_remote_work_employee ON remote_work(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_employee ON performance(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_employee_month ON payroll(employee_id, month, year);
CREATE INDEX IF NOT EXISTS idx_warnings_employee ON warnings(employee_id);

-- Insert sample audit log entries
INSERT INTO audit_log (id, entity_type, entity_id, action, action_details, user_id, created_date) VALUES
(1, 'EMPLOYEE', 1, 'CREATE', 'Created new employee: Jane Doe', 'admin', NOW()),
(2, 'EMPLOYEE', 2, 'CREATE', 'Created new employee: John Smith', 'admin', NOW()),
(3, 'LEAVE_REQUEST', 1, 'UPDATE', 'Approved leave request for John Smith', 'admin', NOW())
ON CONFLICT (id) DO NOTHING;

-- Display confirmation message
SELECT '✅ Test data initialization completed successfully!' AS confirmation;
