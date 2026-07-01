# PayLink: Payroll Management System — Software Requirements Specification (v2.0)

## 1. Introduction

### 1.1. Project Title
PayLink: Payroll Management System

### 1.2. Project Background
Payroll management is an essential function in organizations because it ensures accurate and timely compensation for employees. Many payroll processes still face challenges such as manual computation, scattered records, and limited accessibility across devices. These issues can slow down administrative work and make it harder for employees and staff to access payroll information conveniently.

This project proposes the design and development of a simple integrated payroll management system from scratch, using ideas and functional inspiration from a previous payroll-related project. The system will be built as a new solution that supports both web and mobile access. It will focus on core payroll functions such as employee record management, payroll computation, and payslip viewing.

A software system is needed to centralize payroll data, improve accuracy, and provide easier access for both administrators and employees. By developing the system from the ground up, the project can be tailored to the required scope, timeline, and user needs while remaining feasible within four weeks.

### 1.3. Problem Statement
There is a need for a simple integrated payroll management system that can be developed from scratch and support both web and mobile platforms. Existing payroll processes may be difficult to manage when records are manual, fragmented, or not easily accessible on mobile devices. Therefore, the proposed system aims to provide a centralized, user-friendly, and efficient payroll solution for administrators and employees.

### 1.4. Project Objectives

**General Objective**
- To design and develop a simple integrated payroll management system from scratch that supports both web and mobile access through a centralized backend and database architecture.

**Specific Objectives**
- To design and implement a web application for managing employee records and payroll transactions within the 4-week project period.
- To develop a mobile application that allows employees to view their payslips and payroll history.
- To create a centralized database that stores employee, payroll, and payslip records consistently across both platforms.
- To implement basic payroll computation that calculates gross pay, deductions, and net pay accurately.
- To ensure that the system supports at least two user roles: admin/HR staff and employees.
- To complete the system using the selected technology stack within the allotted project timeframe.

### 1.5. Scope of the Project
The system shall include:
- user authentication and role-based access
- employee record management
- basic payroll computation
- payslip generation
- payroll viewing on web
- payroll viewing on mobile for employees
- centralized database storage

### 1.6. Limitations of the Project
The system will not include:
- biometric attendance integration
- SMS or email notifications
- bank transfer or accounting system integration
- advanced reporting and analytics
- complex approval workflows
- multi-device support beyond Android for mobile
- fully automated tax and government contribution calculations unless kept very basic

## 2. Overall Description

### 2.1. Product Perspective
The system is a multi-platform system composed of two client applications: a web application and a mobile application. Both platforms will communicate with a single backend service developed in Spring Boot, which will handle the business logic and data processing. The web application will be built using React JS, while the mobile application will be developed using Kotlin for Android. A centralized relational database such as PostgreSQL or MySQL will store the payroll and employee data. This structure allows both platforms to share the same information and ensures consistency across the system.

### 2.2. User and Characteristics

**1. Admin / HR Staff**
- have full access to employee records and payroll functions
- create and update employee information
- enter payroll details and generate payslips
- manage system data through the web application

**2. Employees**
- have limited access based on their role
- can log in to view payslips and payroll history
- can use the mobile application for convenience
- do not modify payroll data

### 2.3. Operating Environment

**Hardware**
- Desktop or laptop computer for development and web access
- Android smartphone or emulator for mobile access
- Server or cloud machine for backend deployment

**Software**
- Backend: Spring Boot
- Web Frontend: React JS
- Mobile Frontend: Kotlin
- Database: PostgreSQL or MySQL
- Development Tools: IntelliJ IDEA, Android Studio, VS Code, Git/GitHub

**Other Tools**
- Web browser for testing and accessing the web application
- Android emulator or physical device for testing the mobile application
- Internet connection for backend API communication and deployment

### 2.4. Assumptions and Dependencies
- the system will be developed from scratch as a new project
- users will have valid login credentials to access the system
- payroll data will be entered manually during development and testing
- the backend API will remain accessible to both the web and mobile applications
- the mobile application will support Android devices only
- the system will depend on a working database connection for storing and retrieving records
- future updates or deployment changes will depend on the selected hosting environment and server availability
- the project scope will remain limited to core payroll functions to keep it feasible within four weeks

## 3. System Features and Functional Requirements

### 3.1. Feature 1: User Authentication
Allows users to securely log in to the system based on their assigned role.
- The system shall allow users to log in using a username and password.
- The system shall verify user credentials before granting access.
- The system shall restrict access based on user role.
- The system shall allow users to log out securely.

### 3.2. Feature 2: Employee Record Management
- The system shall allow authorized users to add new employee records.
- The system shall allow authorized users to edit employee details.
- The system shall allow authorized users to view employee lists and profiles.
- The system shall store employee information in the database.

### 3.3. Feature 3: Payroll Computation
- The system shall compute the employee's gross salary.
- The system shall apply basic deductions and allowances.
- The system shall calculate the employee's net pay.
- The system shall save payroll records for each pay period.

### 3.4. Feature 4: Payslip Generation
- The system shall generate a payslip after payroll computation.
- The system shall display the employee's salary details in the payslip.
- The system shall store generated payslip records.
- The system shall allow payslip viewing by authorized users.

### 3.5. Feature 5: Payroll Viewing
- The system shall allow employees to view their payroll history.
- The system shall allow admin or HR staff to view payroll summaries.
- The system shall display payroll records in a readable format.
- The system shall retrieve payroll data from the database.

### 3.6. Feature 6: Mobile Viewing Access
- The system shall allow employees to log in through the mobile application.
- The system shall display employee payslips on mobile devices.
- The system shall allow employees to view payroll history on mobile.
- The system shall provide a simple mobile-friendly interface.

## 4. Non-Functional Requirements
- The system shall load pages within 3 seconds under normal conditions.
- The system shall allow only authenticated users to access payroll data.
- The system shall support web access through modern browsers and Android access through the mobile app.
- The system shall store payroll records without data loss during normal operation.

## 5. Business Rules
1. Each account must have a defined role (Admin/HR staff or Employee).
2. Only Admin/HR staff can manage employee records, process payroll, and create payslips.
3. Employees can only access their own payroll details and payslips; they cannot edit payroll information.
4. A payslip can only be generated after the payroll for a specific employee and pay period has been processed.
5. Every employee profile must be connected to a valid user account for authentication and access control.
6. Payroll records are created per individual employee and must not be shared across multiple users.
7. Each payroll record must refer to a specific pay period.
8. Users must authenticate with valid credentials before accessing any part of the system.
9. Employee, payroll, and payslip data must be saved centrally in the system database.

## 6. Requirements Traceability

### 6.1 Functional Requirements
| ID | Description |
|----|-------------|
| FR-01 | Log in using a username and password |
| FR-02 | Verify user credentials before granting access |
| FR-03 | Restrict access based on user role |
| FR-04 | Log out securely |
| FR-05 | Add new employee records |
| FR-06 | Edit employee details |
| FR-07 | View employee lists and profiles |
| FR-08 | Compute gross salary |
| FR-09 | Apply basic deductions and allowances |
| FR-10 | Calculate net pay |
| FR-11 | Save payroll records for each pay period |
| FR-12 | Generate a payslip after payroll computation |
| FR-13 | Display the employee's salary details in the payslip |
| FR-14 | Store generated payslip records |
| FR-15 | Employees view their payroll history |
| FR-16 | HR staff view payroll summaries |
| FR-17 | Employees log in through the mobile application |
| FR-18 | Display employee payslips on mobile devices |
| FR-19 | Employees view payroll history on mobile |

### 6.2 Non-Functional Requirements
| ID | Description |
|----|-------------|
| NFR-01 | Respond quickly / process payroll within a reasonable time |
| NFR-02 | Protect sensitive payroll data through secure login and role-based access |
| NFR-03 | Simple and user-friendly interface |
| NFR-04 | Accurately store, retrieve, and display data without frequent errors |
| NFR-05 | Structured for easy updates and future improvements |
| NFR-06 | Work on modern web browsers and Android devices |
| NFR-07 | Accessible whenever users need it, subject to server/internet availability |
| NFR-08 | Designed so it can support additional features in the future |

---

## Implementation Notes (Progress Log)

- **2026-07-01**: Initial database schema created (`users`, `employees`, `pay_periods`, `payrolls`, `payroll_items`, `payslips`) via Flyway migration `V1__init_schema.sql`. Backend connected to Supabase (PostgreSQL). Login & Registration implemented for the web app (Spring Security + JWT, React Context + React Router). Mobile app and full Employee/Payroll/Payslip CRUD features deferred to later sessions.
