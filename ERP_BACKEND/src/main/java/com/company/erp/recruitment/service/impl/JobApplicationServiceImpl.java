package com.company.erp.recruitment.service.impl;

import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.common.enums.EmployeeStatus;
import com.company.erp.common.enums.EmploymentType;
import com.company.erp.common.enums.UserRole;
import com.company.erp.common.exception.BusinessLogicException;
import com.company.erp.recruitment.dto.JobApplicationDTO;
import com.company.erp.recruitment.entity.JobApplication;
import com.company.erp.recruitment.entity.JobApplicationStatus;
import com.company.erp.recruitment.entity.JobOffer;
import com.company.erp.recruitment.repository.JobApplicationRepository;
import com.company.erp.recruitment.repository.JobOfferRepository;
import com.company.erp.recruitment.service.JobApplicationService;
import com.company.erp.recruitment.service.RecruitmentEmailService;
import com.company.erp.security.entity.User;
import com.company.erp.security.repository.UserRepository;
import com.company.erp.notification.dto.EmailRequest;
import com.company.erp.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobOfferRepository jobOfferRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final RecruitmentEmailService recruitmentEmailService;

    @Override
    public JobApplicationDTO createApplication(JobApplicationDTO applicationDTO) {
        // Check if already applied
        if (jobApplicationRepository.existsByJobOfferIdAndEmail(
                applicationDTO.getJobOfferId(),
                applicationDTO.getEmail())) {
            throw new RuntimeException("You have already applied for this position");
        }

        JobOffer jobOffer = jobOfferRepository.findById(applicationDTO.getJobOfferId())
                .orElseThrow(() -> new RuntimeException("Job Offer not found"));

        JobApplication application = JobApplication.builder()
                .jobOffer(jobOffer)
                .applicantName(applicationDTO.getApplicantName())
                .email(applicationDTO.getEmail())
                .phone(applicationDTO.getPhone())
                .coverLetter(applicationDTO.getCoverLetter())
                .resumeUrl(applicationDTO.getResumeUrl())
                .portfolio(applicationDTO.getPortfolio())
                .status(JobApplicationStatus.PENDING)
                .applicationDate(LocalDateTime.now())
                .linkedinUrl(applicationDTO.getLinkedinUrl())
                .website(applicationDTO.getWebsite())
                .yearsOfExperience(applicationDTO.getYearsOfExperience())
                .build();

        JobApplication savedApplication = jobApplicationRepository.save(application);
        return mapToDTO(savedApplication);
    }

    @Override
    public JobApplicationDTO updateApplication(Long id, JobApplicationDTO applicationDTO) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setApplicantName(applicationDTO.getApplicantName());
        application.setPhone(applicationDTO.getPhone());
        application.setCoverLetter(applicationDTO.getCoverLetter());
        application.setResumeUrl(applicationDTO.getResumeUrl());
        application.setPortfolio(applicationDTO.getPortfolio());
        application.setLinkedinUrl(applicationDTO.getLinkedinUrl());
        application.setWebsite(applicationDTO.getWebsite());
        application.setYearsOfExperience(applicationDTO.getYearsOfExperience());

        JobApplication updatedApplication = jobApplicationRepository.save(application);
        return mapToDTO(updatedApplication);
    }

    @Override
    public JobApplicationDTO updateApplicationStatus(Long id, JobApplicationStatus status, 
                                                     String reviewedBy, String reviewNotes) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(status);
        application.setReviewedDate(LocalDateTime.now());
        application.setReviewNotes(reviewNotes);

        JobApplication updatedApplication = jobApplicationRepository.save(application);
        
        // Send email notification based on status change
        recruitmentEmailService.sendStatusChangeEmail(updatedApplication, status, reviewNotes);
        
        // AUTO-CONVERSION: If status is ACCEPTED, create employee record
        if (status == JobApplicationStatus.ACCEPTED) {
            convertApplicationToEmployee(updatedApplication);
        }
        
        return mapToDTO(updatedApplication);
    }

    @Override
    @Transactional(readOnly = true)
    public JobApplicationDTO getApplicationById(Long id) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        return mapToDTO(application);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobApplicationDTO> getAllApplications(Pageable pageable) {
        return jobApplicationRepository.findAll(pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobApplicationDTO> getApplicationsByJobOffer(Long jobOfferId, Pageable pageable) {
        return jobApplicationRepository.findByJobOfferId(jobOfferId, pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobApplicationDTO> getApplicationsByStatus(JobApplicationStatus status, Pageable pageable) {
        return jobApplicationRepository.findByStatus(status, pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobApplicationDTO> getApplicationsByApplicantEmail(String email, Pageable pageable) {
        return jobApplicationRepository.findByEmail(email, pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobApplicationDTO> searchApplications(String applicantName, Pageable pageable) {
        return jobApplicationRepository.findByApplicantNameContainingIgnoreCase(applicantName, pageable)
                .map(this::mapToDTO);
    }

    @Override
    public void deleteApplication(Long id) {
        jobApplicationRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countPendingApplications() {
        return jobApplicationRepository.countByJobOfferIdAndStatus(null, JobApplicationStatus.PENDING);
    }

    @Override
    @Transactional(readOnly = true)
    public Boolean hasAlreadyApplied(Long jobOfferId, String email) {
        return jobApplicationRepository.existsByJobOfferIdAndEmail(jobOfferId, email);
    }

    /**
     * Convert an accepted job application to an Employee record with User account
     */
    private void convertApplicationToEmployee(JobApplication application) {
        try {
            // Check if employee already exists with this email
            if (employeeRepository.existsByEmail(application.getEmail())) {
                log.warn("Employee with email {} already exists, skipping conversion", application.getEmail());
                return;
            }

            // Split applicant name into first and last name
            String[] nameParts = application.getApplicantName().trim().split("\\s+", 2);
            String firstName = nameParts[0];
            String lastName = nameParts.length > 1 ? nameParts[1] : "";

            // Get the job offer details for salary and other info
            JobOffer jobOffer = application.getJobOffer();
            
            // Create new employee record
            Employee newEmployee = Employee.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(application.getEmail())
                    .phone(application.getPhone())
                    .hireDate(LocalDate.now())
                    .salary(jobOffer.getSalaryMin() != null ? jobOffer.getSalaryMin() : BigDecimal.ZERO)
                    .employmentType(EmploymentType.FULL_TIME)
                    .status(EmployeeStatus.ACTIVE)
                    .jobPosition(jobOffer.getTitle())
                    .build();

            // Create corresponding User account
            String temporaryPassword = generateTemporaryPassword();
            String encodedPassword = passwordEncoder.encode(temporaryPassword);
            
            User newUser = User.builder()
                    .username(application.getEmail())
                    .password(encodedPassword)
                    .role(UserRole.EMPLOYEE)
                    .enabled(true)
                    .build();

            // Set audit fields after building
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setUpdatedAt(LocalDateTime.now());

            User savedUser = userRepository.save(newUser);
            newEmployee.setUser(savedUser);

            Employee savedEmployee = employeeRepository.save(newEmployee);

            log.info("Job application accepted and converted to Employee (ID: {}) and User account for email: {}", 
                    savedEmployee.getId(), application.getEmail());

            // Send welcome email to new employee
            try {
                sendWelcomeEmail(savedEmployee, temporaryPassword, jobOffer);
            } catch (Exception e) {
                log.warn("Failed to send welcome email to {}: {}", application.getEmail(), e.getMessage());
            }

        } catch (Exception e) {
            log.error("Error converting job application to employee: {}", e.getMessage(), e);
            // Don't throw exception to prevent application status update from failing
        }
    }

    /**
     * Generate a temporary password for new employees
     */
    private String generateTemporaryPassword() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder password = new StringBuilder();

        for (int i = 0; i < 10; i++) {
            password.append(characters.charAt(random.nextInt(characters.length())));
        }

        return password.toString();
    }

    /**
     * Send welcome email with credentials to newly hired employee
     */
    private void sendWelcomeEmail(Employee employee, String temporaryPassword, JobOffer jobOffer) {
        String subject = "Welcome to ERP System - Your Account is Ready";
        
        String body = String.format(
                "Dear %s %s,\n\n" +
                "Congratulations! Your job application has been accepted and you are now an employee.\n\n" +
                "Position: %s\n" +
                "Start Date: %s\n" +
                "Salary: %s\n\n" +
                "Your ERP System Account:\n" +
                "Username (Email): %s\n" +
                "Temporary Password: %s\n\n" +
                "Please log in and change your password immediately for security purposes.\n" +
                "Visit: https://your-erp-domain.com to access the system.\n\n" +
                "If you have any issues accessing your account, please contact the HR department.\n\n" +
                "Best regards,\n" +
                "HR Team",
                employee.getFirstName(),
                employee.getLastName(),
                jobOffer.getTitle(),
                employee.getHireDate(),
                jobOffer.getSalaryMin() != null ? jobOffer.getSalaryMin() : "TBD",
                employee.getEmail(),
                temporaryPassword
        );

        EmailRequest emailRequest = EmailRequest.builder()
                .to(employee.getEmail())
                .subject(subject)
                .body(body)
                .isHtml(false)
                .build();

        notificationService.sendEmail(emailRequest);
    }

    private JobApplicationDTO mapToDTO(JobApplication application) {
        return JobApplicationDTO.builder()
                .id(application.getId())
                .jobOfferId(application.getJobOffer().getId())
                .jobOfferTitle(application.getJobOffer().getTitle())
                .applicantName(application.getApplicantName())
                .email(application.getEmail())
                .phone(application.getPhone())
                .coverLetter(application.getCoverLetter())
                .resumeUrl(application.getResumeUrl())
                .portfolio(application.getPortfolio())
                .status(application.getStatus().name())
                .applicationDate(application.getApplicationDate())
                .reviewedDate(application.getReviewedDate())
                .reviewNotes(application.getReviewNotes())
                .linkedinUrl(application.getLinkedinUrl())
                .website(application.getWebsite())
                .yearsOfExperience(application.getYearsOfExperience())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .build();
    }
}
