-- Fix column size issues for recruitment entities
-- This script increases VARCHAR lengths to prevent "value too long for type character varying(255)" errors

-- Fix candidates table
ALTER TABLE candidates
    ALTER COLUMN candidate_name TYPE VARCHAR(500),
    ALTER COLUMN position TYPE VARCHAR(500),
    ALTER COLUMN notes TYPE TEXT;

-- Fix job_applications table
ALTER TABLE job_applications
    ALTER COLUMN applicant_name TYPE VARCHAR(500),
    ALTER COLUMN email TYPE VARCHAR(255),
    ALTER COLUMN phone TYPE VARCHAR(20),
    ALTER COLUMN cover_letter TYPE TEXT,
    ALTER COLUMN resume_url TYPE TEXT,
    ALTER COLUMN portfolio TYPE TEXT,
    ALTER COLUMN review_notes TYPE TEXT,
    ALTER COLUMN linkedin_url TYPE TEXT,
    ALTER COLUMN website TYPE TEXT;

-- Fix job_offers table
ALTER TABLE job_offers
    ALTER COLUMN title TYPE VARCHAR(500),
    ALTER COLUMN department TYPE VARCHAR(500),
    ALTER COLUMN job_location TYPE VARCHAR(500),
    ALTER COLUMN job_type TYPE VARCHAR(50),
    ALTER COLUMN benefits TYPE TEXT;

-- Fix interview_schedules table
ALTER TABLE interview_schedules
    ALTER COLUMN title TYPE VARCHAR(500),
    ALTER COLUMN description TYPE TEXT,
    ALTER COLUMN location TYPE VARCHAR(500),
    ALTER COLUMN meeting_link TYPE VARCHAR(1000),
    ALTER COLUMN interviewer_name TYPE VARCHAR(500),
    ALTER COLUMN interviewer_email TYPE VARCHAR(500),
    ALTER COLUMN feedback_notes TYPE VARCHAR(500);

-- Verify the changes
SELECT table_name, column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name IN ('candidates', 'job_applications', 'job_offers', 'interview_schedules')
AND data_type LIKE 'character%'
ORDER BY table_name, ordinal_position;
