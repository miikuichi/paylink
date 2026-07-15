package edu.cit.sevilla.paylink.features.holidays.infrastructure;

import edu.cit.sevilla.paylink.features.holidays.domain.HolidayCalendar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HolidayCalendarRepository extends JpaRepository<HolidayCalendar, Long> {
    boolean existsByHolidayDateAndIsActiveTrueAndIsTentativeFalse(LocalDate holidayDate);

    boolean existsByHolidayDateAndIsActiveTrue(LocalDate holidayDate);

    List<HolidayCalendar> findAllByOrderByHolidayDateAsc();

    List<HolidayCalendar> findAllByIsActiveTrueOrderByHolidayDateAsc();

    Optional<HolidayCalendar> findByHolidayDate(LocalDate holidayDate);

    boolean existsByHolidayDateAndIdNot(LocalDate holidayDate, Long id);
}
