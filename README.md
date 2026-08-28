# 🚀 ERP Management Platform — HR & Business Management System

A modern, modular **ERP Management Platform** designed to centralize and automate key business processes, with a strong focus on **Human Resources, employee lifecycle management, payroll, attendance, recruitment, assets, performance, and organizational management**.

The project is built with a **Spring Boot REST API**, **PostgreSQL**, **JWT-based security**, and a modular architecture designed to be scalable and maintainable.

---

## 📌 Overview

Managing employees and internal business processes often requires multiple disconnected tools.

This platform provides a centralized solution where organizations can manage their employees and HR operations through a single system.

### Core objectives

* 👥 Centralize employee information
* 🏢 Manage departments and organizational structure
* ⏰ Track attendance and working hours
* 🏖️ Manage employee leave requests and balances
* 💰 Automate payroll calculations
* 🎯 Manage employee performance
* 📋 Manage recruitment processes
* 💻 Track company assets
* 🏠 Manage remote work requests
* ⚠️ Manage employee warnings and disciplinary actions
* 🚪 Manage employee resignation and exit workflows
* 📊 Provide business and HR visibility
* 🔐 Secure access using authentication and role-based authorization
* 📝 Keep track of important system actions through auditing

---

# ✨ Main Features

## 👤 Employee Management

Complete employee lifecycle management.

Features include:

* Employee profiles
* Personal information
* Professional information
* Department assignment
* Employment information
* Employee status
* Employee history
* Employee-related documents

---

## 🏢 Department Management

Manage the company's organizational structure.

* Create departments
* Update departments
* Assign employees
* Manage department information
* Retrieve department employees

---

## ⏰ Attendance Management

Track employee attendance and working time.

* Check-in / check-out
* Attendance records
* Working hours
* Late arrivals
* Attendance history
* Attendance-based business rules

---

## 🏖️ Leave Management

Complete leave management workflow.

Employees can:

* Submit leave requests
* Check leave status
* View leave history
* Check available leave balance

HR/Managers can:

* Review requests
* Approve/reject requests
* Manage leave balances
* Apply business rules

### Business rules

The system handles cases such as:

* Overlapping leave requests
* Leave balance validation
* Holiday exclusion
* Unpaid leave
* Request status management

---

## 💰 Payroll Management

Payroll processing with automated calculations.

The payroll module can take into consideration:

* Base salary
* Bonuses
* Overtime
* Unpaid leave
* Tax parameters
* Social insurance parameters
* Deductions
* Final salary

This reduces manual payroll calculations and helps maintain consistency.

---

## 🎯 Performance Management

Employee performance evaluation system.

Features include:

* Performance evaluations
* Evaluation criteria
* Employee performance history
* Performance scores
* Performance monitoring
* Performance-related alerts

---

## 🎯 Recruitment Management

Manage the recruitment lifecycle.

Example workflow:

```text
Candidate
   ↓
Application
   ↓
Evaluation
   ↓
Interview
   ↓
Decision
   ↓
ACCEPTED
   ↓
Employee Creation
```

One of the implemented business rules allows an accepted candidate to be transformed into an employee.

---

## 💻 Asset Management

Track company assets assigned to employees.

Examples:

* Laptops
* Phones
* Equipment
* Office material

The system can manage:

* Asset inventory
* Asset assignment
* Employee assets
* Asset return

Asset tracking is also integrated with employee exit processes.

---

## 🏠 Remote Work Management

Employees can request remote work.

The system provides:

* Remote work requests
* Approval workflow
* Request history
* Remote work limits
* Status tracking

---

## ⚠️ Warning & Disciplinary Management

Manage employee warnings and disciplinary actions.

The system can record:

* Warnings
* Reasons
* Dates
* Employee history
* Disciplinary actions

Attendance-related events can also be used to trigger warnings according to business rules.

---

## 🚪 Employee Exit Management

Structured employee resignation and exit workflow.

### Exit workflow

```text
SUBMITTED
    ↓
MANAGER_APPROVED
    ↓
HR_APPROVED
    ↓
COMPLETED
```

The exit process can include:

* Asset return
* Leave settlement
* Final payroll
* Account deactivation
* Data archiving
* Exit checklist

This provides a structured employee offboarding process instead of simply deleting an employee from the database.

---

## 🎉 Events & Holidays

Manage organizational events and holidays.

Examples:

* Company events
* Public holidays
* Internal events
* Holiday calendars

Holiday information can also be taken into account by other modules such as leave management.

---

## 🔐 Security

The application uses a security layer based on:

* JWT authentication
* Role-based authorization
* Secure password handling
* Protected API endpoints
* Authentication filters
* User roles and permissions

Example roles can include:

```text
ADMIN
HR
MANAGER
EMPLOYEE
```

The exact permissions depend on the implementation of each module.

---

# 🏗️ Architecture

The backend follows a modular architecture where each business domain is separated into its own module.

```text
ERP Management Platform
│
├── Authentication & Security
│
├── Employee
│
├── Department
│
├── Attendance
│
├── Leave
│
├── Payroll
│
├── Recruitment
│
├── Performance
│
├── Asset
│
├── Remote Work
│
├── Warning
│
├── Employee Exit
│
├── Holiday
│
├── Event
│
└── Audit
```

This organization makes the system easier to:

* Maintain
* Test
* Extend
* Debug
* Scale

---

# 🛠️ Technology Stack

## Backend

| Technology         | Purpose                        |
| ------------------ | ------------------------------ |
| ☕ Java 17          | Programming language           |
| 🌱 Spring Boot 3.2 | Backend framework              |
| 🔐 Spring Security | Authentication & authorization |
| 🎟️ JWT            | Stateless authentication       |
| 🗄️ PostgreSQL     | Relational database            |
| 🧩 Spring Data JPA | Database persistence           |
| 🛠️ Hibernate      | ORM                            |
| 📦 Maven           | Dependency management          |
| 🐳 Docker          | Containerization               |
| 📖 REST API        | Backend communication          |

---

# 📁 Project Structure

```text
ERP-Managementt-Software-Saas/
│
├── ERP_BACKEND/
│   │
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │
│   │   │   └── resources/
│   │   │
│   │   └── test/
│   │
│   ├── pom.xml
│   ├── Dockerfile
│   └── ...
│
├── documentation/
│
├── database/
│
├── docker/
│
└── README.md
```

### Backend modules

```text
ERP_BACKEND
│
├── account
├── asset
├── attendance
├── audit
├── department
├── employee
├── event
├── exit
├── holiday
├── leave
├── payroll
├── performance
├── recruitment
├── remotework
├── security
└── warning
```

---

# 🔄 Example Business Workflow

A typical employee lifecycle can be represented as:

```text
                    ┌───────────────┐
                    │  Recruitment  │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    Candidate  │
                    └───────┬───────┘
                            │
                         ACCEPTED
                            │
                            ▼
                    ┌───────────────┐
                    │    Employee   │
                    └───────┬───────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
     Attendance          Leave            Performance
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
                       ┌─────────┐
                       │ Payroll │
                       └────┬────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Employee Exit │
                    └───────────────┘
```

---

# ⚙️ Installation

## Prerequisites

Make sure you have installed:

* Java 17+
* Maven
* PostgreSQL
* Git
* Docker *(optional)*

---

## 1. Clone the repository

```bash
git clone https://github.com/GABSIWAEL/ERP-Managementt-Software-Saas.git

cd ERP-Managementt-Software-Saas
```

---

## 2. Configure PostgreSQL

Create a PostgreSQL database:

```sql
CREATE DATABASE erp_management;
```

Then configure your database connection in:

```text
ERP_BACKEND/src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/erp_management
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

> Do not commit real database credentials or JWT secrets to GitHub.

---

## 3. Build the project

```bash
cd ERP_BACKEND

mvn clean install
```

---

## 4. Run the application

```bash
mvn spring-boot:run
```

The backend will normally be available at:

```text
http://localhost:8080
```

---

# 🐳 Docker

The project also includes Docker support.

Build the image:

```bash
docker build -t erp-management-backend .
```

Run the container:

```bash
docker run -p 8080:8080 erp-management-backend
```

For a complete deployment, PostgreSQL can also be configured as a Docker service.

---

# 🔌 API

The application exposes REST endpoints organized around business domains.

Example endpoint categories:

```text
/api/auth
/api/employees
/api/departments
/api/attendance
/api/leaves
/api/payroll
/api/recruitment
/api/performance
/api/assets
/api/remotework
/api/warnings
/api/exit
/api/holidays
/api/events
```

The exact endpoint paths should be checked against the controller mappings in the current version of the project.

---

# 🧪 Testing

The project contains testing support for backend functionality.

Run the test suite with:

```bash
mvn test
```

For a full build:

```bash
mvn clean verify
```

---

# 📊 Project Highlights

This project goes beyond basic CRUD operations by implementing **business workflows and cross-module rules**.

### Examples

* 🔄 Recruitment → automatic employee creation
* 🏖️ Leave balance validation
* 📅 Holiday-aware leave calculations
* ⏰ Attendance-based rules
* ⚠️ Automatic warning scenarios
* 💰 Payroll calculations
* 💻 Asset assignment and return
* 🚪 Structured employee offboarding
* 🔐 JWT authentication
* 👥 Role-based access control
* 📝 Audit tracking
* 🧩 Modular domain architecture

---

# 🎯 What I Learned

Building this project provided practical experience in:

### Backend Development

* Designing REST APIs
* Spring Boot architecture
* Spring Security
* JWT authentication
* JPA/Hibernate
* PostgreSQL
* Transaction management
* Business logic implementation

### Software Architecture

* Modular architecture
* Separation of concerns
* DTO-based API design
* Entity relationships
* Service/repository patterns
* Domain-oriented organization

### DevOps

* Docker
* Application configuration
* Database deployment
* Environment variables
* Containerized applications

### Business Analysis

The project also required translating real HR requirements into technical business rules and workflows.

---

# 🚀 Future Improvements

Potential improvements include:

* 📊 Advanced HR dashboards
* 📈 Business intelligence & analytics
* 📱 Mobile application
* 🔔 Real-time notifications
* 📧 Email notifications
* 📄 Automated document generation
* 🤖 AI-assisted HR analytics
* ☁️ Cloud deployment
* 🔄 CI/CD pipeline
* 📦 Microservices evolution
* 🌍 Multi-company support
* 🌐 Multi-language support
* 💳 Subscription & billing management
* 🏢 Complete multi-tenant SaaS architecture

---

# 👨‍💻 Author

**Wael Gabsi**

Software Engineer

Interested in:

* Backend Development
* Full-Stack Development
* Software Architecture
* DevOps
* Cloud Computing
* Enterprise Applications

---

# 📄 License

This project is intended for educational, portfolio, and demonstration purposes.

---

⭐ If you find this project interesting, consider giving the repository a star!

**GitHub Repository:**
https://github.com/GABSIWAEL/ERP-Managementt-Software-Saas
