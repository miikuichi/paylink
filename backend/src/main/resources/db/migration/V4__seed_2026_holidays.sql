-- =====================================================================
-- V4__seed_2026_holidays.sql
-- Adds baseline 2026 holiday records so calendar views show expected dates.
-- Note: movable holidays may still require yearly verification/adjustment.
-- =====================================================================

INSERT INTO holiday_calendar (holiday_date, name, holiday_type, is_tentative, is_active) VALUES
('2026-01-01', 'New Year''s Day', 'REGULAR', FALSE, TRUE),
('2026-02-10', 'EDSA Revolution Anniversary', 'SPECIAL', FALSE, TRUE),
('2026-06-12', 'Independence Day', 'REGULAR', FALSE, TRUE),
('2026-08-21', 'Ninoy Aquino Day', 'SPECIAL', FALSE, TRUE),
('2026-11-01', 'All Saints'' Day', 'SPECIAL', FALSE, TRUE),
('2026-11-30', 'Bonifacio Day', 'REGULAR', FALSE, TRUE),
('2026-12-08', 'Feast of the Immaculate Conception', 'SPECIAL', FALSE, TRUE),
('2026-12-25', 'Christmas Day', 'REGULAR', FALSE, TRUE),
('2026-12-30', 'Rizal Day', 'REGULAR', FALSE, TRUE),
('2026-12-31', 'Last Day of the Year', 'SPECIAL', FALSE, TRUE)
ON CONFLICT (holiday_date) DO NOTHING;
