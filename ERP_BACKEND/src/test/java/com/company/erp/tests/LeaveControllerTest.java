package com.company.erp.tests;

import com.company.erp.common.enums.LeaveStatus;
import com.company.erp.common.enums.LeaveType;
import com.company.erp.department.entity.Department;
import com.company.erp.department.repository.DepartmentRepository;
import com.company.erp.employee.entity.Employee;
import com.company.erp.employee.repository.EmployeeRepository;
import com.company.erp.leave.dto.LeaveRequestDTO;
import com.company.erp.leave.entity.LeaveRequest;
import com.company.erp.leave.repository.LeaveRequestRepository;
import com.company.erp.tests.base.BaseIntegrationTest;
import com.company.erp.tests.fixtures.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Leave Controller
 * Tests leave request creation, approval workflow, and role-based access
 */
@DisplayName("Leave Controller Tests")
class LeaveControllerTest extends BaseIntegrationTest {

    private static final String LEAVE_BASE_URL = "/api/leaves";

    @Autowired
    private LeaveRequestRepository leaveRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    private Department department;
    private Employee employee;
    private Employee manager;

    @BeforeEach
    public void setupLeaveTest() {
        // Create department
        department = departmentRepository.save(
                TestDataFactory.createDepartment("Sales", "Sales Department")
        );

        // Create employee
        employee = employeeRepository.save(
                TestDataFactory.createEmployee("Jane", "Doe", "jane.doe@company.com",
                        department, new BigDecimal("75000"))
        );

        // Create manager
        manager = employeeRepository.save(
                TestDataFactory.createEmployee("Manager", "Boss", "manager@company.com",
                        department, new BigDecimal("95000"))
        );
    }

    @Test
    @DisplayName("Should create a new leave request as Employee")
    void testCreateLeaveRequest_AsEmployee() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.now().plusDays(5);
        LocalDate endDate = LocalDate.now().plusDays(9);
        
        LeaveRequestDTO leaveRequestDTO = TestDataFactory.createLeaveRequestDTO(
                employee.getId(), startDate, endDate, 5, LeaveType.ANNUAL.name()
        );

        // Act & Assert
        mockMvc.perform(post(LEAVE_BASE_URL)
                .header("Authorization", getAuthHeader(employeeToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(leaveRequestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Leave request created successfully"))
                .andExpect(jsonPath("$.data.type").value(LeaveType.ANNUAL.name()))
                .andExpect(jsonPath("$.data.status").value(LeaveStatus.PENDING.name()));
    }

    @Test
    @DisplayName("Should create a leave request as Manager")
    void testCreateLeaveRequest_AsManager() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.now().plusDays(10);
        LocalDate endDate = LocalDate.now().plusDays(14);
        
        LeaveRequestDTO leaveRequestDTO = TestDataFactory.createLeaveRequestDTO(
                manager.getId(), startDate, endDate, 5, LeaveType.SICK.name()
        );

        // Act & Assert
        mockMvc.perform(post(LEAVE_BASE_URL)
                .header("Authorization", getAuthHeader(managerToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(leaveRequestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.type").value(LeaveType.SICK.name()));
    }

    @Test
    @DisplayName("Should return 400 when end date is before start date")
    void testCreateLeaveRequest_InvalidDateRange() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.now().plusDays(10);
        LocalDate endDate = LocalDate.now().plusDays(5); // Before start date
        
        LeaveRequestDTO leaveRequestDTO = TestDataFactory.createLeaveRequestDTO(
                employee.getId(), startDate, endDate, -5, LeaveType.ANNUAL.name()
        );

        // Act & Assert
        mockMvc.perform(post(LEAVE_BASE_URL)
                .header("Authorization", getAuthHeader(employeeToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(leaveRequestDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should approve leave request as Manager")
    void testApproveLeave_AsManager() throws Exception {
        // Arrange
        LeaveRequest leaveRequest = leaveRepository.save(
                TestDataFactory.createLeaveRequest(employee,
                        LocalDate.now().plusDays(5),
                        LocalDate.now().plusDays(9),
                        5, LeaveType.ANNUAL)
        );

        // Act & Assert
        mockMvc.perform(post(LEAVE_BASE_URL + "/" + leaveRequest.getId() + "/approve")
                .header("Authorization", getAuthHeader(managerToken))
                .param("comment", "Approved"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Leave request approved"))
                .andExpect(jsonPath("$.data.status").value(LeaveStatus.APPROVED.name()));

        // Verify status changed
        LeaveRequest updatedLeave = leaveRepository.findById(leaveRequest.getId()).orElse(null);
        assert updatedLeave != null;
        assert updatedLeave.getStatus() == LeaveStatus.APPROVED;
    }

    @Test
    @DisplayName("Should reject leave request with comment")
    void testRejectLeave() throws Exception {
        // Arrange
        LeaveRequest leaveRequest = leaveRepository.save(
                TestDataFactory.createLeaveRequest(employee,
                        LocalDate.now().plusDays(5),
                        LocalDate.now().plusDays(9),
                        5, LeaveType.ANNUAL)
        );

        // Act & Assert
        mockMvc.perform(post(LEAVE_BASE_URL + "/" + leaveRequest.getId() + "/reject")
                .header("Authorization", getAuthHeader(managerToken))
                .param("comment", "Already approved leaves on those dates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Leave request rejected"))
                .andExpect(jsonPath("$.data.status").value(LeaveStatus.REJECTED.name()));

        // Verify status changed
        LeaveRequest updatedLeave = leaveRepository.findById(leaveRequest.getId()).orElse(null);
        assert updatedLeave != null;
        assert updatedLeave.getStatus() == LeaveStatus.REJECTED;
        assert updatedLeave.getManagerComment() != null;
    }

    @Test
    @DisplayName("Should return 403 when non-manager tries to approve leave")
    void testApproveLeave_AccessDenied() throws Exception {
        // Arrange
        LeaveRequest leaveRequest = leaveRepository.save(
                TestDataFactory.createLeaveRequest(employee,
                        LocalDate.now().plusDays(5),
                        LocalDate.now().plusDays(9),
                        5, LeaveType.ANNUAL)
        );

        // Act & Assert
        mockMvc.perform(post(LEAVE_BASE_URL + "/" + leaveRequest.getId() + "/approve")
                .header("Authorization", getAuthHeader(employeeToken))
                .param("comment", "Attempting to approve"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should cancel leave request as Employee")
    void testCancelLeave_AsEmployee() throws Exception {
        // Arrange
        LeaveRequest leaveRequest = leaveRepository.save(
                TestDataFactory.createLeaveRequest(employee,
                        LocalDate.now().plusDays(5),
                        LocalDate.now().plusDays(9),
                        5, LeaveType.ANNUAL)
        );

        // Act & Assert
        mockMvc.perform(post(LEAVE_BASE_URL + "/" + leaveRequest.getId() + "/cancel")
                .header("Authorization", getAuthHeader(employeeToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Leave request cancelled"));

        // Verify status changed
        LeaveRequest updatedLeave = leaveRepository.findById(leaveRequest.getId()).orElse(null);
        assert updatedLeave != null;
        assert updatedLeave.getStatus() == LeaveStatus.CANCELLED;
    }

    @Test
    @DisplayName("Should get all leaves as HR")
    void testGetAllLeaves_AsHR() throws Exception {
        // Arrange
        leaveRepository.saveAll(List.of(
                TestDataFactory.createLeaveRequest(employee,
                        LocalDate.now().plusDays(5),
                        LocalDate.now().plusDays(9),
                        5, LeaveType.ANNUAL),
                TestDataFactory.createLeaveRequest(manager,
                        LocalDate.now().plusDays(10),
                        LocalDate.now().plusDays(12),
                        3, LeaveType.SICK)
        ));

        // Act & Assert
        mockMvc.perform(get(LEAVE_BASE_URL)
                .header("Authorization", getAuthHeader(hrToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    @DisplayName("Should update leave request as Employee")
    void testUpdateLeaveRequest() throws Exception {
        // Arrange
        LeaveRequest leaveRequest = leaveRepository.save(
                TestDataFactory.createLeaveRequest(employee,
                        LocalDate.now().plusDays(5),
                        LocalDate.now().plusDays(9),
                        5, LeaveType.ANNUAL)
        );

        LeaveRequestDTO updateDTO = TestDataFactory.createLeaveRequestDTO(
                employee.getId(),
                LocalDate.now().plusDays(5),
                LocalDate.now().plusDays(8), // Changed end date
                4, // Changed duration
                LeaveType.ANNUAL.name()
        );

        // Act & Assert
        mockMvc.perform(put(LEAVE_BASE_URL + "/" + leaveRequest.getId())
                .header("Authorization", getAuthHeader(employeeToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Should list pending leaves for manager review")
    void testGetPendingLeaves() throws Exception {
        // Arrange
        leaveRepository.saveAll(List.of(
                TestDataFactory.createLeaveRequest(employee,
                        LocalDate.now().plusDays(5),
                        LocalDate.now().plusDays(9),
                        5, LeaveType.ANNUAL)
        ));

        // Act & Assert
        mockMvc.perform(get(LEAVE_BASE_URL)
                .header("Authorization", getAuthHeader(managerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("Should verify leave request data persistence")
    void testLeaveRequestDataPersistence() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.now().plusDays(15);
        LocalDate endDate = LocalDate.now().plusDays(19);
        
        LeaveRequestDTO leaveRequestDTO = TestDataFactory.createLeaveRequestDTO(
                employee.getId(), startDate, endDate, 5, LeaveType.MATERNITY.name()
        );

        // Act
        mockMvc.perform(post(LEAVE_BASE_URL)
                .header("Authorization", getAuthHeader(employeeToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(leaveRequestDTO)))
                .andExpect(status().isCreated());

        // Assert - Verify in database
        List<LeaveRequest> savedLeaves = leaveRepository.findAll();
        LeaveRequest savedLeave = savedLeaves.stream()
                .filter(l -> l.getEmployee().getId().equals(employee.getId())
                        && l.getType() == LeaveType.MATERNITY)
                .findFirst()
                .orElse(null);
        
        assert savedLeave != null;
        assert savedLeave.getStatus() == LeaveStatus.PENDING;
        assert savedLeave.getTotalDays() == 5;
    }

    @Test
    @DisplayName("Should return 401 without authorization")
    void testUnauthorizedAccess() throws Exception {
        // Act & Assert
        mockMvc.perform(get(LEAVE_BASE_URL))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should return 404 when approving non-existent leave")
    void testApproveNonExistentLeave() throws Exception {
        // Act & Assert
        mockMvc.perform(post(LEAVE_BASE_URL + "/99999/approve")
                .header("Authorization", getAuthHeader(managerToken))
                .param("comment", "Testing"))
                .andExpect(status().isNotFound());
    }
}
