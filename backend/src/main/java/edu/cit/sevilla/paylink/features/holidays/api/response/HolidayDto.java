package edu.cit.sevilla.paylink.features.holidays.api.response;

import edu.cit.sevilla.paylink.features.holidays.domain.HolidayCalendar;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record HolidayDto(
        Long id,
        LocalDate holidayDate,
        String name,
        String holidayType,
        Boolean isTentative,
        Boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static HolidayDto from(HolidayCalendar holiday) {
        return new HolidayDto(
                holiday.getId(),
                holiday.getHolidayDate(),
                holiday.getName(),
                holiday.getHolidayType(),
                holiday.getIsTentative(),
                holiday.getIsActive(),
                holiday.getCreatedAt(),
                holiday.getUpdatedAt());
    }
}
