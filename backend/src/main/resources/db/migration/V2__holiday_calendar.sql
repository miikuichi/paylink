-- =====================================================================
-- V2__holiday_calendar.sql
-- DB-backed holiday calendar with tentative holiday support
-- =====================================================================

CREATE TABLE holiday_calendar (
    id           BIGSERIAL PRIMARY KEY,
    holiday_date DATE         NOT NULL UNIQUE,
    name         VARCHAR(120) NOT NULL,
    holiday_type VARCHAR(20)  NOT NULL CHECK (holiday_type IN ('REGULAR', 'SPECIAL')),
    is_tentative BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_holiday_calendar_date ON holiday_calendar(holiday_date);

-- 2024 holidays
INSERT INTO holiday_calendar (holiday_date, name, holiday_type, is_tentative, is_active) VALUES
('2024-01-01', 'New Year''s Day', 'REGULAR', FALSE, TRUE),
('2024-02-10', 'EDSA Revolution Anniversary', 'SPECIAL', FALSE, TRUE),
('2024-02-12', 'Chinese New Year', 'SPECIAL', FALSE, TRUE),
('2024-02-13', 'Chinese New Year', 'SPECIAL', FALSE, TRUE),
('2024-03-28', 'Maundy Thursday', 'REGULAR', FALSE, TRUE),
('2024-03-29', 'Good Friday', 'REGULAR', FALSE, TRUE),
('2024-03-30', 'Black Saturday', 'SPECIAL', FALSE, TRUE),
('2024-04-09', 'Day of Valor', 'REGULAR', FALSE, TRUE),
('2024-04-10', 'Eid''l Fitr', 'SPECIAL', FALSE, TRUE),
('2024-06-12', 'Independence Day', 'REGULAR', FALSE, TRUE),
('2024-06-17', 'Eid''l Adha', 'SPECIAL', FALSE, TRUE),
('2024-08-21', 'Ninoy Aquino Day', 'SPECIAL', FALSE, TRUE),
('2024-08-26', 'National Heroes Day', 'REGULAR', FALSE, TRUE),
('2024-11-01', 'All Saints'' Day', 'SPECIAL', FALSE, TRUE),
('2024-11-11', 'Bonifacio Day', 'REGULAR', FALSE, TRUE),
('2024-12-08', 'Feast of the Immaculate Conception', 'SPECIAL', FALSE, TRUE),
('2024-12-25', 'Christmas Day', 'REGULAR', FALSE, TRUE),
('2024-12-30', 'Rizal Day', 'REGULAR', FALSE, TRUE),
('2024-12-31', 'Additional Special Day', 'SPECIAL', FALSE, TRUE)
ON CONFLICT (holiday_date) DO NOTHING;

-- 2025 holidays
INSERT INTO holiday_calendar (holiday_date, name, holiday_type, is_tentative, is_active) VALUES
('2025-01-01', 'New Year''s Day', 'REGULAR', FALSE, TRUE),
('2025-02-10', 'EDSA Revolution Anniversary', 'SPECIAL', FALSE, TRUE),
('2025-02-12', 'Chinese New Year', 'SPECIAL', FALSE, TRUE),
('2025-02-13', 'Chinese New Year', 'SPECIAL', FALSE, TRUE),
('2025-04-09', 'Day of Valor', 'REGULAR', FALSE, TRUE),
('2025-04-17', 'Maundy Thursday', 'REGULAR', FALSE, TRUE),
('2025-04-18', 'Good Friday', 'REGULAR', FALSE, TRUE),
('2025-04-19', 'Black Saturday', 'SPECIAL', FALSE, TRUE),
('2025-04-30', 'Special Non-Working Day', 'SPECIAL', FALSE, TRUE),
('2025-05-12', 'Eid''l Fitr', 'SPECIAL', TRUE, TRUE),
('2025-06-12', 'Independence Day', 'REGULAR', FALSE, TRUE),
('2025-06-23', 'Eid''l Adha', 'SPECIAL', TRUE, TRUE),
('2025-08-21', 'Ninoy Aquino Day', 'SPECIAL', FALSE, TRUE),
('2025-08-25', 'National Heroes Day', 'REGULAR', FALSE, TRUE),
('2025-11-01', 'All Saints'' Day', 'SPECIAL', FALSE, TRUE),
('2025-11-11', 'Bonifacio Day', 'REGULAR', FALSE, TRUE),
('2025-12-08', 'Feast of the Immaculate Conception', 'SPECIAL', FALSE, TRUE),
('2025-12-25', 'Christmas Day', 'REGULAR', FALSE, TRUE),
('2025-12-30', 'Rizal Day', 'REGULAR', FALSE, TRUE),
('2025-12-31', 'Additional Special Day', 'SPECIAL', FALSE, TRUE)
ON CONFLICT (holiday_date) DO NOTHING;
