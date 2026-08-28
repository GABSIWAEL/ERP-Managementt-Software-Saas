-- ===================================================================
-- Job Recruitment Module - Database Schema
-- Tables: job_offers, job_applications
-- ===================================================================

-- Create job_offers table
CREATE TABLE IF NOT EXISTS job_offers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT,
    requirements LONGTEXT,
    department VARCHAR(100),
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    job_location VARCHAR(255),
    job_type VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline TIMESTAMP NULL,
    number_of_positions INT,
    filled_positions INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    benefits LONGTEXT,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_department (department),
    INDEX idx_posted_date (posted_date),
    INDEX idx_is_active (is_active)
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    job_offer_id BIGINT NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    cover_letter LONGTEXT,
    resume_url VARCHAR(500),
    portfolio LONGTEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_date TIMESTAMP NULL,
    review_notes LONGTEXT,
    linkedin_url VARCHAR(500),
    website VARCHAR(500),
    years_of_experience INT,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_offer_id) REFERENCES job_offers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_offer_id, email),
    INDEX idx_status (status),
    INDEX idx_job_offer_id (job_offer_id),
    INDEX idx_email (email),
    INDEX idx_application_date (application_date)
);

-- Create index for quick searches
CREATE INDEX idx_job_offers_title ON job_offers(title);
CREATE INDEX idx_job_applications_applicant_name ON job_applications(applicant_name);
