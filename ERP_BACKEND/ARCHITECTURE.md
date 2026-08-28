# ERP System - Technical Architecture & Component Overview

## 🏗️ Complete Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT REQUESTS                          │
│                    (REST API Calls with JWT)                    │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  @RestController Classes                                │  │
│  │  ├─ AuthController           (Public: Login/Register)   │  │
│  │  ├─ DepartmentController     (ADMIN, HR)               │  │
│  │  ├─ EmployeeController       (Multiple roles)          │  │
│  │  ├─ LeaveController          (Template ready)          │  │
│  │  ├─ AttendanceController     (Template ready)          │  │
│  │  ├─ PayrollController        (ACCOUNTANT)              │  │
│  │  └─ ... (12 more modules)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Security Layer:                                                 │
│  ├─ JwtAuthenticationFilter     (Token validation)              │
│  ├─ SecurityConfig              (Role-based authorization)      │
│  └─ JwtTokenProvider            (Token generation/parsing)      │
│                                                                  │
│  Global Handlers:                                                │
│  ├─ GlobalExceptionHandler      (Error formatting)              │
│  └─ ApiResponse<T>              (Response wrapper)              │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                              │
│             (Business Logic & Validations)                      │
│                                                                  │
│  Service Pairs (Interface + Implementation):                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ MODULE 1-2: FULLY IMPLEMENTED                          │   │
│  ├─ DepartmentService            ✓ Complete              │   │
│  │  └─ DepartmentServiceImpl       (Validation, CRUD)     │   │
│  └─ EmployeeService              ✓ Complete              │   │
│     └─ EmployeeServiceImpl        (Lifecycle mgmt)        │   │
│  ├─ AuthService                  ✓ Complete              │   │
│  │  └─ AuthServiceImpl            (JWT generation)        │   │
│  │                                                         │   │
│  │ MODULE 3-14: TEMPLATE READY (Follow patterns)          │   │
│  ├─ HolidayService               (Holiday management)     │   │
│  ├─ LeaveService                 (Complex calculations)   │   │
│  ├─ AttendanceService            (Clock in/out logic)     │   │
│  ├─ RemoteWorkService            (Approval workflow)      │   │
│  ├─ AccountingParameterService   (Config management)      │   │
│  ├─ PayrollService               (Salary calculations)    │   │
│  ├─ PerformanceService           (Evaluations)           │   │
│  ├─ WarningService               (Discipline tracking)    │   │
│  ├─ AssetService                 (Inventory mgmt)         │   │
│  ├─ RecruitmentService           (Candidate pipeline)     │   │
│  ├─ EventService                 (Event management)       │   │
│  └─ AuditService                 (Action logging)         │   │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Cross-cutting Concerns:                                        │
│  ├─ @Transactional               (Transaction management)      │
│  ├─ Exception throwing           (Business logic validation)   │
│  ├─ Audit logging                (Action tracking)             │
│  └─ Role checking                (Authorization)               │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                            │
│            (Data Access & Repository Pattern)                   │
│                                                                  │
│  Spring Data JPA Repositories:                                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ CRUD Operations (findBy*, save, delete, etc.)          │   │
│  │                                                         │   │
│  │ ├─ UserRepository                                       │   │
│  │ ├─ DepartmentRepository                                │   │
│  │ ├─ EmployeeRepository        (findByEmail, etc.)      │   │
│  │ ├─ HolidayRepository                                   │   │
│  │ ├─ LeaveRequestRepository    (Overlapping detection)  │   │
│  │ ├─ AttendanceRepository                               │   │
│  │ ├─ RemoteWorkRequestRepository                         │   │
│  │ ├─ AccountingParameterRepository                       │   │
│  │ ├─ PayrollRepository         (Monthly queries)         │   │
│  │ ├─ PerformanceEvaluationRepository                    │   │
│  │ ├─ WarningRepository         (Status filtering)        │   │
│  │ ├─ AssetRepository                                     │   │
│  │ ├─ CandidateRepository                                │   │
│  │ ├─ EventRepository                                     │   │
│  │ └─ AuditLogRepository        (User action tracking)   │   │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Features:                                                       │
│  ├─ @Query annotations (custom SQL/JPQL)                       │
│  ├─ Method query derivation (findByXyz)                        │
│  ├─ Pagination & sorting support                              │
│  └─ JPA auditing integration (@CreatedDate, @LastModifiedDate) │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ENTITY/DOMAIN LAYER                        │
│              (JPA Entity Classes & Relationships)               │
│                                                                  │
│  Base Classes (Inheritance):                                    │
│  └─ BaseEntity (extends Serializable)                          │
│     └─ AbstractAuditableEntity extends BaseEntity              │
│        ├─ id (PK, Auto-increment)                              │
│        ├─ createdAt (@CreatedDate)                             │
│        └─ updatedAt (@LastModifiedDate)                        │
│                                                                  │
│  Entity Classes (14 Total):                                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ CORE ENTITIES                                           │   │
│  │                                                         │   │
│  │ User                                                    │   │
│  │ ├─ id (Long, PK)                                       │   │
│  │ ├─ username (String, unique, required)                │   │
│  │ ├─ password (String, BCrypt encoded, required)        │   │
│  │ ├─ role (Enum: ADMIN|HR|MANAGER|EMPLOYEE|ACCOUNTANT)│   │
│  │ └─ enabled (Boolean, required)                        │   │
│  │                                                         │   │
│  │ Department                                             │   │
│  │ ├─ id (Long, PK)                                       │   │
│  │ ├─ name (String, unique, required)                    │   │
│  │ ├─ description (String)                               │   │
│  │ ├─ manager (OneToOne FK→Employee)                     │   │
│  │ ├─ employees (OneToMany)                              │   │
│  │ ├─ createdAt (Timestamp)                              │   │
│  │ └─ updatedAt (Timestamp)                              │   │
│  │                                                         │   │
│  │ Employee                                               │   │
│  │ ├─ id (Long, PK)                                       │   │
│  │ ├─ firstName, lastName (String, required)             │   │
│  │ ├─ email (String, unique, required)                   │   │
│  │ ├─ phone (String)                                      │   │
│  │ ├─ hireDate (LocalDate, required)                     │   │
│  │ ├─ salary (BigDecimal, required)                      │   │
│  │ ├─ employmentType (Enum)                              │   │
│  │ ├─ status (Enum: ACTIVE|INACTIVE|TERMINATED)          │   │
│  │ ├─ department (ManyToOne FK→Department)               │   │
│  │ ├─ user (OneToOne FK→User)                            │   │
│  │ ├─ createdAt (Timestamp)                              │   │
│  │ └─ updatedAt (Timestamp)                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ HR MANAGEMENT ENTITIES                                  │   │
│  │                                                         │   │
│  │ Holiday                → Holiday management            │   │
│  │ LeaveRequest           → Leave requests (PENDING, APP) │   │
│  │ Attendance             → Daily attendance tracking     │   │
│  │ RemoteWorkRequest      → Home office requests          │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FINANCIAL ENTITIES                                      │   │
│  │                                                         │   │
│  │ AccountingParameter    → Tax, insurance, etc.          │   │
│  │ Payroll                → Salary slip + calculations    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ MANAGEMENT ENTITIES                                     │   │
│  │                                                         │   │
│  │ PerformanceEvaluation → Quarterly evaluations          │   │
│  │ Warning                → Discipline warnings           │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ OPERATIONAL ENTITIES                                    │   │
│  │                                                         │   │
│  │ Asset                  → Equipment management          │   │
│  │ Candidate              → Recruitment pipeline          │   │
│  │ Event                  → Company events                │   │
│  │ AuditLog               → Action tracking (non-audit)   │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                               │
│                   (PostgreSQL Database)                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ TABLES (14 total)                                        │  │
│  │                                                          │  │
│  │ ┌─────────────┐         ┌──────────────┐               │  │
│  │ │   users     │         │ departments  │               │  │
│  │ ├─ id (PK)   │◄────────┤─ id (PK)     │               │  │
│  │ ├─ username  │ 1:1      ├─ manager_id  │               │  │
│  │ ├─ password  │          │ (FK→employees)               │  │
│  │ ├─ role      │          └──────────────┘               │  │
│  │ └─ enabled   │                  ▲                      │  │
│  │              │                  │                      │  │
│  │              │          ┌──────────────┐               │  │
│  │              │          │  employees   │               │  │
│  │              │ 1:1      ├─ id (PK)     │               │  │
│  │              └─────────►├─ user_id (FK)                │  │
│  │                         ├─ department_id (FK)◄────┐   │  │
│  │                         │ (Many:One)           │   │  │
│  │                         └──────────────┘       │   │  │
│  │                              ▲                 │   │  │
│  │                              │                 │   │  │
│  │        ┌─────────────────────┼─────────┐      │   │  │
│  │        │                     │         │      │   │  │
│  │   ┌────────────┐   ┌──────────────┐  ┌─────────┐ │  │
│  │   │ leave_     │   │ attendance   │  │ remote_ │ │  │
│  │   │ requests   │   │              │  │ work_   │ │  │
│  │   └────────────┘   └──────────────┘  │ requests│ │  │
│  │        ▲                  ▲           └─────────┘ │  │
│  │        │                  │              ▲        │  │
│  │        └──────────────────┼──────────────┼────────┘  │
│  │                           │              │           │
│  │        (All have FK→employees.id)        │           │
│  │                                          │           │
│  │   ┌──────────────────────────────────────┼─────┐    │
│  │   │                                      │     │    │
│  │   ▼                                      ▼     ▼    │
│  │ ┌─────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │ │ payroll │  │ warnings │  │ asset (assigned  │    │
│  │ │         │  │          │  │ to→employee_id)  │    │
│  │ │ (complex│  │(discipline)  │                 │    │
│  │ │ calc.)  │  │          │  │                 │    │
│  │ │         │  │          │  │                 │    │
│  │ └─────────┘  └──────────┘  └──────────────────┘    │
│  │                                                      │
│  │   ┌──────────────┐  ┌──────────────────────┐       │
│  │   │ performance_ │  │ candidates           │       │
│  │   │ evaluations  │  │ (recruitment)        │       │
│  │   │ (employee +  │  │                      │       │
│  │   │  evaluator)  │  │                      │       │
│  │   └──────────────┘  └──────────────────────┘       │
│  │         ▲                     ▲                     │
│  │         │                     │                     │
│  │         └─────────────────────┘                     │
│  │                                                      │
│  │   ┌─────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │   │   holidays  │  │    events    │  │audit_    │  │
│  │   │             │  │ (created_by→ │  │ logs     │  │
│  │   │ (for calc.) │  │ users.id)    │  │(tracking)│  │
│  │   │             │  │              │  │          │  │
│  │   └─────────────┘  └──────────────┘  └──────────┘  │
│  │                                                      │
│  │   ┌──────────────────────────────┐                 │
│  │   │ accounting_parameters        │                 │
│  │   │ (tax, insurance, etc.)       │                 │
│  │   │ (single record for system)   │                 │
│  │   └──────────────────────────────┘                 │
│  └──────────────────────────────────────────────────────┘
│                                                                  │
│  Features:                                                       │
│  ├─ Foreign keys with cascade settings                         │
│  ├─ Unique constraints on critical fields                      │
│  ├─ Indexes on frequently queried columns                      │
│  ├─ Audit columns (created_at, updated_at)                    │
│  ├─ Enum columns for status tracking                          │
│  ├─ Decimal precision for financial data                      │
│  └─ Proper normalization (3NF)                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Example: Create Department

```
1. CLIENT REQUEST
   └─► POST /api/departments
       {
         "name": "Sales Department",
         "description": "Sales division"
       }

2. CONTROLLER LAYER
   └─► DepartmentController.createDepartment()
       ├─ Validates @Valid annotation
       ├─ Checks role @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
       ├─ Logs: "Creating new department: Sales Department"
       └─► Calls service.create()

3. SERVICE LAYER
   └─► DepartmentServiceImpl.createDepartment()
       ├─ Validates business rule: Check if name exists
       │  └─ if exists: throw BusinessLogicException
       ├─ Maps DTO to Entity
       ├─ Adds @Transactional context
       └─► Calls repository.save()

4. PERSISTENCE LAYER
   └─► DepartmentRepository.save()
       ├─ Receives Department entity
       ├─ Triggers JPA Auditing:
       │  ├─ createdAt = now()
       │  ├─ updatedAt = now()
       │  └─ @CreatedBy from SecurityContext
       └─► SQL: INSERT INTO departments (...)

5. DATABASE LAYER
   └─► PostgreSQL
       ├─ Executes INSERT
       ├─ Validates constraints
       ├─ Commits transaction on success
       ├─ Rolls back on error
       └─► Returns generated ID

6. SERVICE LAYER (Return)
   └─► Maps Entity back to DTO
       └─► Returns DepartmentDTO with ID

7. CONTROLLER LAYER (Response)
   └─► Wraps in ApiResponse<DepartmentDTO>
       {
         "success": true,
         "message": "Department created successfully",
         "data": {
           "id": 1,
           "name": "Sales Department",
           "description": "Sales division"
         },
         "statusCode": 201
       }

8. CLIENT RESPONSE
   └─► 201 Created
       └─► JSON response received
```

---

## 🔐 Security Flow: Login & Token Usage

```
1. LOGIN REQUEST
   ├─ POST /api/auth/login
   └─ Body: {"username":"admin", "password":"pass123"}

2. AuthController.login()
   ├─ Validates input
   └─► Calls authService.login()

3. AuthServiceImpl.login()
   ├─ Finds User by username
   ├─ Validates enabled status
   ├─ Matches password (BCrypt):
   │  └─ passwordEncoder.matches(input, stored)
   └─► jwtTokenProvider.generateToken()

4. JwtTokenProvider.generateToken()
   ├─ Creates Claims object (username, role)
   ├─ Sets expiration (24 hours default)
   ├─ Signs with HMAC-SHA512
   └─► Returns JWT token

5. Response to Client
   └─► {
         "token": "eyJ0eXAi...",
         "username": "admin",
         "role": "ADMIN",
         "type": "Bearer"
       }

6. SUBSEQUENT REQUEST WITH TOKEN
   ├─ Client sends:
   │  └─ Authorization: Bearer eyJ0eXAi...
   └─► Spring processes request

7. JwtAuthenticationFilter.doFilterInternal()
   ├─ Extracts token from "Bearer " prefix
   ├─ Validates token: jwtTokenProvider.validateToken()
   │  ├─ Parses JWT
   │  ├─ Verifies signature
   │  ├─ Checks expiration
   │  └─ Returns true/false
   ├─ Extracts username & role
   └─► Sets SecurityContext:
       └─ UsernamePasswordAuthenticationToken(
             username="admin",
             authorities=["ROLE_ADMIN"]
          )

8. SecurityConfig.securityFilterChain()
   ├─ Checks @PreAuthorize annotations
   ├─ Validates user has required role
   ├─ Allows request if authorized
   └─► Proceeds to Controller

9. Controller & Service Layer
   ├─ Process request normally
   ├─ Can access current user: SecurityContextHolder.getContext()
   └─► Service logs user in audit

10. Response sent
    └─► 200 OK with data
```

---

## 📊 Transaction & Audit Flow

```
SERVICE METHOD (marked @Transactional)
    │
    ├─► JPA Auditing Interceptor
    │   ├─ Captures @CreatedDate
    │   ├─ Captures @LastModifiedDate
    │   ├─ Captures @CreatedBy (from SecurityContext)
    │   └─ Captures @LastModifiedBy
    │
    ├─► Business Logic
    │   ├─ Validations
    │   ├─ Calculations
    │   └─ Status changes
    │
    ├─► Repository Write Operations
    │   ├─ save()
    │   ├─ delete()
    │   └─ flush()
    │
    ├─► Database Transaction
    │   ├─ BEGIN TRANSACTION
    │   ├─ Execute SQL
    │   ├─ If success: COMMIT
    │   ├─ If error: ROLLBACK
    │   └─ All-or-nothing guarantee
    │
    ├─► Audit Logging (Manual)
    │   ├─ auditLogRepository.save(
    │   │   AuditLog.builder()
    │   │     .action("OPERATION_NAME")
    │   │     .entityName("EntityClass")
    │   │     .performedBy(getCurrentUsername())
    │   │     .timestamp(now())
    │   │     .details(businessData)
    │   │   )
    │   └─ Creates separate audit record
    │
    └─► Return to Controller
        └─► HTTP Response

ALL CHANGES ATOMIC: Either all succeed or all roll back.
```

---

## 🎯 Module Dependencies Map

```
Core Modules (dependencies):
│
├─ Security Module (no dependencies)
│  └─ User entity
│
├─ Department Module (depends on)
│  └─ Employee entity
│
├─ Employee Module (depends on)
│  ├─ Department
│  └─ User
│
└─ Operational Modules (depend on Employee)
   │
   ├─ Holiday Module
   │  └─ (affects Leave calculations)
   │
   ├─ Leave Module
   │  ├─ Employee
   │  ├─ Holiday (for exclusions)
   │  └─ Department (for manager approval)
   │
   ├─ Attendance Module
   │  ├─ Employee
   │  └─ (feeds into Payroll)
   │
   ├─ Remote Work Module
   │  ├─ Employee
   │  ├─ Holiday (prevent on holidays)
   │  └─ (feeds into Payroll allowance)
   │
   ├─ Payroll Module
   │  ├─ Employee
   │  ├─ Attendance (overtime calculation)
   │  ├─ Leave (unpaid leave deduction)
   │  ├─ RemoteWork (allowance)
   │  ├─ AccountingParameters (tax, insurance)
   │  └─ Department (reporting)
   │
   ├─ Performance Module
   │  └─ Employee (as both evaluatee & evaluator)
   │
   ├─ Warning Module
   │  └─ Employee
   │
   ├─ Asset Module
   │  └─ Employee (assignment)
   │
   ├─ Recruitment Module
   │  └─ Employee (conversion)
   │
   ├─ Event Module
   │  ├─ Employee (birthday detection)
   │  └─ User (event creator)
   │
   └─ Accounting Parameters Module
      └─ (used by Payroll)

Audit Module (cross-cutting):
└─ Logs actions from all modules
```

---

## 💾 Key Database Relationships

```
ONE-TO-ONE Relationships:
├─ User ← → Employee
├─ User → Department (manager)
└─ Department → Employee (manager)

ONE-TO-MANY Relationships:
├─ Department → Employees
├─ Employee → LeaveRequests
├─ Employee → Attendances
├─ Employee → RemoteWorkRequests
├─ Employee → Payrolls
├─ Employee → PerformanceEvaluations (as evaluatee)
├─ Employee → PerformanceEvaluations (as evaluator)
├─ Employee → Warnings
├─ Employee → Assets (assigned to)
└─ User → Events (created by)

Many-To-Many (implicit):
├─ Department → Employees → Holidays (for calculations)
├─ Department → Employees → LeaveBalance
└─ Department → Employees → RemoteWorkQuota
```

---

## ⚙️ Configuration Hierarchy

```
application.yml (Main)
│
├─ Server Config
│  ├─ port: 8080
│  └─ context-path: /api
│
├─ DataSource Config
│  ├─ URL: jdbc:postgresql://...
│  ├─ Username: postgres
│  └─ Password: postgres
│
├─ JPA Config
│  ├─ ddl-auto: validate (production)
│  ├─ show-sql: false
│  └─ Properties (batch_size, etc.)
│
├─ JWT Config
│  ├─ secret: [256-bit key]
│  └─ expiration: 86400000ms (24h)
│
├─ Logging Config
│  ├─ Level (DEBUG, INFO, WARN)
│  ├─ Console pattern
│  └─ File patterns
│
└─ Jackson Config
   ├─ Serialization
   └─ Time zone: UTC

@Configuration Classes:
├─ SecurityConfig
│  ├─ PasswordEncoder
│  └─ SecurityFilterChain
│
└─ AuditConfig
   └─ AuditorAware (current user)
```

---

This architecture provides:

✅ **Separation of Concerns** - Each layer has clear responsibility  
✅ **Testability** - Layers can be tested independently  
✅ **Maintainability** - Changes isolated to specific layers  
✅ **Scalability** - Can handle growth without restructuring  
✅ **Security** - Multiple layers of validation and authorization  
✅ **Auditability** - All changes tracked  
✅ **Reliability** - Transaction management ensures data consistency  

---

**This architecture is production-ready and follows Spring Boot best practices.**
