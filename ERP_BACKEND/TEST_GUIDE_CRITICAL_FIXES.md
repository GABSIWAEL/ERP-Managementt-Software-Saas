# 🧪 IMPLEMENTATION TEST GUIDE
**Date:** February 28, 2026  
**Scope:** Critical Fixes Testing  
**Priority:** BLOCKING - Must pass before production

---

## 📋 TEST CATEGORIES

### 1. PAYROLL INTEGRATION TESTS

#### Test Case 1.1: Overtime Calculation
```
Scenario: Employee works 170 hours in a month (30 hours overtime)
Given: Employee salary = $5,000/month
When: Payroll generated for month with 170 hours worked
Then: 
  - Standard hours: 160 (salary remains $5,000)
  - Overtime hours: 10
  - Hourly rate: $5,000 / 160 = $31.25/hour
  - Overtime amount: 10 hrs × $31.25 × 1.5 = $468.75
  - Actual: Verify overtime field = $468.75
```

#### Test Case 1.2: Unpaid Leave Deduction
```
Scenario: Employee takes 2 days unpaid leave in a month
Given: Employee salary = $5,000/month
       Approved unpaid leave = 2 days
When: Payroll generated
Then:
  - Daily rate: $5,000 / 20 working days = $250/day
  - Deduction: 2 days × $250 = $500
  - Actual: Verify leave deduction = $500
```

#### Test Case 1.3: Full Payroll Calculation
```
Scenario: Complete payroll with all components
Given: 
  - Base salary: $5,000
  - Overtime: $468.75
  - Unpaid leave: $500
  - Tax: 10% = $500
  - Insurance: 5% = $250
When: Payroll generated
Then:
  - Net = 5000 + 468.75 - 500 - 500 - 250 = 4,218.75
  - Verify all components sum correctly
```

#### Test Case 1.4: No Overtime When Under Standard
```
Scenario: Employee works exactly 160 hours (no overtime)
When: Payroll generated
Then: Overtime amount = $0
```

#### Test Case 1.5: No Deduction Without Unpaid Leave
```
Scenario: Employee takes annual/sick leave only (no unpaid)
When: Payroll generated
Then: Leave deduction = $0
```

### 2. ASSET TERMINATION TESTS

#### Test Case 2.1: Block Termination With Unreleased Assets
```
Scenario: Employee has 3 unreleased assets
Given: Employee ID = 1
       Assets:
         - Laptop (ASSIGNED)
         - Phone (ASSIGNED)
         - Monitor (ASSIGNED)
When: terminateEmployee(1) called
Then:
  - Exception thrown: "Cannot terminate. Employee has 3 unreleased assets"
  - Employee status remains unchanged (not TERMINATED)
```

#### Test Case 2.2: Allow Termination When All Assets Returned
```
Scenario: Employee returns all assets
Given: Employee ID = 1
       Assets all marked RETURNED
When: terminateEmployee(1) called
Then:
  - No exception thrown
  - Employee status = TERMINATED
  - Returned count = 0
```

#### Test Case 2.3: Partial Asset Return
```
Scenario: Employee returns 2 of 3 assets
Given: Assets = [RETURNED, RETURNED, ASSIGNED]
When: terminateEmployee() called
Then:
  - Exception thrown: "Cannot terminate. Employee has 1 unreleased asset"
```

#### Test Case 2.4: Query Returns Correct Count
```
Scenario: Verify repository query accuracy
When: countByAssignedToIdAndStatusNot(employeeId) called
Then: Returned count matches actual ASSIGNED assets
```

### 3. CANDIDATE AUTO-CONVERSION TESTS

#### Test Case 3.1: Auto-Convert Accepted Candidate
```
Scenario: Candidate status changed to ACCEPTED
Given: Candidate = {
         name: "John Doe",
         email: "john@example.com",
         position: "Engineer"
       }
When: updateCandidateStatus(candidateId, "ACCEPTED") called
Then:
  - New Employee created with:
    - firstName: "John"
    - lastName: "Doe"
    - email: "john@example.com"
    - hireDate: today
    - salary: $0 (to be configured)
    - employmentType: FULL_TIME
    - status: ACTIVE
  - Audit log created documenting conversion
```

#### Test Case 3.2: Name Parsing Correct
```
Scenario: Various name formats
When: Candidate names processed
Then:
  - "John Doe" → firstName="John", lastName="Doe"
  - "John Michael Doe" → firstName="John", lastName="Michael Doe"
  - "John" → firstName="John", lastName=""
```

#### Test Case 3.3: Prevent Duplicate Employee Creation
```
Scenario: Candidate with email matching existing employee
Given: Employee exists with email="john@example.com"
When: Candidate with same email converted
Then:
  - No new employee created
  - Warning logged: "Employee with email already exists"
  - Conversion skipped gracefully
```

#### Test Case 3.4: Audit Log Created
```
Scenario: Verify audit trail
When: Candidate converted
Then: AuditLog entry:
  - action: "CANDIDATE_CONVERTED_TO_EMPLOYEE"
  - entityName: "Candidate"
  - details: Contains candidate ID and new employee ID
  - timestamp: Set to conversion time
```

#### Test Case 3.5: Non-Accepted Status Not Converted
```
Scenario: Candidate status set to REJECTED
When: updateCandidateStatus(id, "REJECTED") called
Then:
  - No employee created
  - No conversion attempted
```

### 4. AUTO-ABSENT MARKING TESTS

#### Test Case 4.1: Mark Missing Attendance as Absent
```
Scenario: Employee doesn't clock in by 9:00 AM
Given: Current date: 2026-03-01
       Employee has no attendance record for 2026-03-01
When: autoMarkAbsentForMissedClockIn() runs (scheduled for 9:00 AM)
Then:
  - Attendance record created:
    - employee_id: [employee]
    - date: 2026-03-01
    - status: ABSENT
    - checkInTime: NULL
    - checkOutTime: NULL
  - Audit log: Count of marked absent = 1
```

#### Test Case 4.2: Don't Mark If Clock-In Exists
```
Scenario: Employee clocked in at 10:30 AM
Given: Attendance exists for today with checkInTime=10:30
When: autoMarkAbsentForMissedClockIn() runs
Then:
  - No additional ABSENT record created
  - existing attendance record preserved
```

#### Test Case 4.3: Bulk Marking For Multiple Employees
```
Scenario: 100 active employees, 25 haven't clocked in
Given: 100 active employees
       25 without attendance records
When: autoMarkAbsentForMissedClockIn() runs
Then:
  - 25 ABSENT records created
  - 0 ABSENT records for employees who clocked in
  - Audit log: "Marked 25 employees as absent"
```

#### Test Case 4.4: Inactive Employees Not Marked
```
Scenario: Inactive/Terminated employees not marked
Given: Employee status = INACTIVE or TERMINATED
When: autoMarkAbsentForMissedClockIn() runs
Then:
  - Inactive employees not processed
  - Only ACTIVE employees marked
```

### 5. LATE ARRIVAL DETECTION TESTS

#### Test Case 5.1: Create Warning for Late Arrival
```
Scenario: Employee checks in at 10:00 AM (1 hour late)
Given: Attendance: {
         checkInTime: 10:00,
         date: today
       }
When: detectAndFlagLateArrivals() runs (8:30 AM)
Then:
  - Warning created:
    - employeeId: [employee]
    - reason: "Late arrival at 10:00 (Standard time: 9:00 AM)"
    - severity: LOW
  - Audit log: "Late arrival warning created"
```

#### Test Case 5.2: No Warning for On-Time Arrival
```
Scenario: Employee checks in at 8:45 AM
Given: checkInTime: 08:45
When: detectAndFlagLateArrivals() runs
Then:
  - No warning created
  - Attendance not flagged
```

#### Test Case 5.3: Threshold Test At Exactly 9:00 AM
```
Scenario: Edge case - exactly 9:00 AM
Given: checkInTime: 09:00:00
When: detectAndFlagLateArrivals() runs
Then:
  - Decision: Not late (9:00 is on-time)
  - No warning created
```

#### Test Case 5.4: Multiple Late Arrivals
```
Scenario: 5 employees late on same day
When: detectAndFlagLateArrivals() runs
Then:
  - 5 warnings created
  - Each with correct employee ID and time
  - Audit log shows count = 5
```

### 6. EXIT/RESIGNATION WORKFLOW TESTS

#### Test Case 6.1: Submit Resignation
```
Scenario: Employee submits resignation with 30-day notice
Given: Employee ID = 1
       lastWorkingDay = 30 days from now
When: submitResignation(1, lastWorkingDay, "Job relocation") called
Then:
  - ResignationRequest created:
    - status: SUBMITTED
    - submissionDate: today
    - reason: "Job relocation"
  - Audit log: "Resignation submitted"
```

#### Test Case 6.2: Prevent Past Date Resignation
```
Scenario: Employee tries to set last working day in past
Given: lastWorkingDay = yesterday
When: submitResignation(...) called
Then:
  - Exception: "Last working day must be in the future"
  - Resignation not created
```

#### Test Case 6.3: Prevent Duplicate Resignation
```
Scenario: Employee already has pending resignation
Given: Existing resignation with status=SUBMITTED
When: submitResignation(...) called again
Then:
  - Exception: "Employee already has a pending resignation"
```

#### Test Case 6.4: Manager Approval
```
Scenario: Manager reviews and approves resignation
Given: Resignation ID = 1, status = SUBMITTED
When: approveResignationByManager(1, "Approved") called
Then:
  - status: MANAGER_APPROVED
  - managerApprovalDate: now
  - managerComments: "Approved"
```

#### Test Case 6.5: HR Approval Triggers Checklist
```
Scenario: HR final approval initializes exit checklist
Given: Resignation status = MANAGER_APPROVED
When: approveResignationByHR(id, "Approved") called
Then:
  - Resignation status: HR_APPROVED
  - hrApprovalDate: now
  - ExitChecklist created:
    - All items: false
    - completionDate: NULL
  - Audit log: "Exit checklist initialized"
```

#### Test Case 6.6: Rejection Workflow
```
Scenario: Manager rejects resignation
Given: Resignation status = SUBMITTED
When: rejectResignation(id, "Business critical") called
Then:
  - status: REJECTED
  - managerComments: "Business critical"
  - No further approvals possible
```

#### Test Case 6.7: Cancellation Workflow
```
Scenario: Employee changes mind and cancels
Given: Resignation status = SUBMITTED
When: cancelResignation(id) called
Then:
  - status: CANCELLED
  - Employee remains ACTIVE
  - Exit checklist removed (if exists)
```

#### Test Case 6.8: Complete Exit Checklist
```
Scenario: All exit items marked complete
Given: Resignation approved by HR
       All checklist fields = true
When: completeExitProcess(resignationId) called
Then:
  - Resignation status: COMPLETED
  - Employee status: TERMINATED
  - checklist.completionDate: now
  - Final audit log created
```

#### Test Case 6.9: Check Completion Validation
```
Scenario: Try to complete with incomplete checklist
Given: Checklist:
         - assetsReturned: true
         - leaveSettled: true
         - finalPayrollProcessed: false  ← Missing
         - userAccountDeactivated: true
         - dataArchived: true
When: completeExitProcess() called
Then:
  - Exception: "Exit checklist must be fully completed"
  - Process not completed
```

#### Test Case 6.10: Retrieve Resignation History
```
Scenario: Get all resignations for employee
Given: Employee with 3 past resignations
When: getResignationsByEmployeeId(employeeId) called
Then:
  - Returns all 3 resignations
  - Sorted by date
  - All statuses preserved
```

### 7. INTEGRATION TESTS

#### Test Case 7.1: Full Exit Process Flow
```
Scenario: Complete exit from submission to termination
Given: Employee John Doe (ID=1)
When:
  1. submitResignation(1, 30-days-out, "Relocation")
  2. approveResignationByManager(resignId, "OK")
  3. approveResignationByHR(resignId, "OK")
  4. markAssetsReturned(resignId)
  5. markLeaveSettled(resignId)
  6. markFinalPayrollProcessed(resignId)
  7. markUserAccountDeactivated(resignId)
  8. markDataArchived(resignId)
  9. completeExitProcess(resignId)
Then:
  - Employee status: TERMINATED
  - All audit logs created
  - User account disabled
  - Resignation marked COMPLETED
```

#### Test Case 7.2: Recruitment to Employment Pipeline
```
Scenario: Candidate accepts offer → becomes employee
When:
  1. createCandidate("Jane Smith", "jane@example.com", "Manager")
  2. updateCandidateStatus(candidateId, "INTERVIEW")
  3. updateCandidateStatus(candidateId, "ACCEPTED")
Then:
  - Employee created with Jane's details
  - Employee usable in payroll/attendance
  - Full audit trail recorded
```

#### Test Case 7.3: Payroll With Real Attendance
```
Scenario: Payroll calculation with actual attendance records
Given: Employee with:
       - Base salary: $6,000
       - 170 attendance hours (10 overtime)
       - 2 unpaid leave days
       - Tax rate: 12%, Insurance: 6%
When: generatePayroll(...) called
Then:
  - overtimeAmount: calculated correctly
  - leaveDeduction: calculated correctly
  - Taxes & insurance: applied
  - netSalary: all components included
```

---

## 🚀 TEST EXECUTION PLAN

### Phase 1: Unit Testing (Week 1)
- Execute individual test cases 1-5
- Verify each component in isolation
- Target: 95%+ test pass rate

### Phase 2: Integration Testing (Week 1-2)
- Execute workflow tests 6.1-6.10
- Test end-to-end scenarios
- Verify audit logging
- Target: 100% workflow completion

### Phase 3: System Testing (Week 2)
- Full regression test suite
- Load testing with 1000+ employees
- Performance benchmarks
- Database integrity checks

### Phase 4: UAT (Week 2-3)
- Select HR team members test
- Real-world scenario validation
- User experience feedback
- Bug identification

---

## ✅ SUCCESS CRITERIA

All tests must pass with:
1. ✅ No critical bugs
2. ✅ No data integrity issues
3. ✅ Complete audit trails
4. ✅ All calculations accurate within $0.01
5. ✅ API response times < 200ms
6. ✅ Database transactions consistent
7. ✅ Error messages meaningful
8. ✅ Proper authorization/authentication

---

## 📊 TEST METRICS

| Metric | Target | Status |
|--------|--------|--------|
| Test Coverage | 95%+ | To be verified |
| Pass Rate | 100% | To be verified |
| Critical Bugs | 0 | To be verified |
| High Priority Bugs | 0 | To be verified |
| Performance (avg response) | < 200ms | To be verified |
| Data Integrity | 100% | To be verified |

---

