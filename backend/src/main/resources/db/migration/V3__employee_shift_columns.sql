-- =====================================================================
-- V3__employee_shift_columns.sql
-- Adds employee shift schedule fields for hour-based payroll processing
-- =====================================================================

ALTER TABLE employees
    ADD COLUMN shift_start TIME NOT NULL DEFAULT '09:00:00',
    ADD COLUMN shift_end   TIME NOT NULL DEFAULT '18:00:00';
