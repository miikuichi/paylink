-- =====================================================================
-- V1__init_schema.sql
-- PayLink: Payroll Management System - Initial Schema
-- Covers: Users (Auth), Employees, Pay Periods, Payrolls, Payroll Items, Payslips
-- Target: PostgreSQL (Supabase)
-- =====================================================================

-- ---------------------------------------------------------------------
-- users: authentication + role-based access (FR-01 to FR-04, Business Rule 1, 8)
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN', 'EMPLOYEE')),
    enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- employees: employee record management (FR-05 to FR-07, Business Rule 5)
-- Every employee profile is linked to exactly one user account.
-- ---------------------------------------------------------------------
CREATE TABLE employees (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_number VARCHAR(20)  NOT NULL UNIQUE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    position        VARCHAR(100),
    department      VARCHAR(100),
    date_hired      DATE,
    basic_rate      NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- pay_periods: payroll is processed per pay period (Business Rule 7)
-- ---------------------------------------------------------------------
CREATE TABLE pay_periods (
    id         BIGSERIAL PRIMARY KEY,
    start_date DATE        NOT NULL,
    end_date   DATE        NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PROCESSED', 'CLOSED')),
    created_at TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pay_period_range UNIQUE (start_date, end_date),
    CONSTRAINT chk_pay_period_dates CHECK (end_date >= start_date)
);

-- ---------------------------------------------------------------------
-- payrolls: payroll computation (FR-08 to FR-11, Business Rule 4, 6)
-- One payroll record per employee per pay period.
-- ---------------------------------------------------------------------
CREATE TABLE payrolls (
    id               BIGSERIAL PRIMARY KEY,
    employee_id      BIGINT       NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    pay_period_id    BIGINT       NOT NULL REFERENCES pay_periods(id) ON DELETE CASCADE,
    gross_pay        NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_allowances NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_deductions NUMERIC(12, 2) NOT NULL DEFAULT 0,
    net_pay          NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status           VARCHAR(20)  NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PROCESSED')),
    processed_by     BIGINT       REFERENCES users(id),
    processed_at     TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_payroll_employee_period UNIQUE (employee_id, pay_period_id)
);

-- ---------------------------------------------------------------------
-- payroll_items: line items for allowances/deductions (FR-09)
-- Flexible line-item model instead of fixed columns, so new
-- allowance/deduction types can be added later without a schema change.
-- ---------------------------------------------------------------------
CREATE TABLE payroll_items (
    id         BIGSERIAL PRIMARY KEY,
    payroll_id BIGINT       NOT NULL REFERENCES payrolls(id) ON DELETE CASCADE,
    item_type  VARCHAR(20)  NOT NULL CHECK (item_type IN ('ALLOWANCE', 'DEDUCTION')),
    label      VARCHAR(100) NOT NULL,
    amount     NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- payslips: payslip generation (FR-12 to FR-14, Business Rule 4)
-- A payslip can only exist for a payroll that has been processed.
-- ---------------------------------------------------------------------
CREATE TABLE payslips (
    id         BIGSERIAL PRIMARY KEY,
    payroll_id BIGINT    NOT NULL UNIQUE REFERENCES payrolls(id) ON DELETE CASCADE,
    issued_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    remarks    VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Indexes for common lookups (foreign keys used in joins/filters)
-- ---------------------------------------------------------------------
CREATE INDEX idx_employees_user_id        ON employees(user_id);
CREATE INDEX idx_payrolls_employee_id     ON payrolls(employee_id);
CREATE INDEX idx_payrolls_pay_period_id   ON payrolls(pay_period_id);
CREATE INDEX idx_payroll_items_payroll_id ON payroll_items(payroll_id);
CREATE INDEX idx_payslips_payroll_id      ON payslips(payroll_id);
