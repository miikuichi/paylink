package edu.cit.sevilla.paylink.features.holidays.application;

import edu.cit.sevilla.paylink.features.holidays.api.request.UpsertHolidayRequest;
import edu.cit.sevilla.paylink.features.holidays.api.response.HolidayDto;
import edu.cit.sevilla.paylink.features.holidays.domain.HolidayCalendar;
import edu.cit.sevilla.paylink.features.holidays.infrastructure.HolidayCalendarRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HolidayCalendarService {

    private final HolidayCalendarRepository holidayCalendarRepository;

    public List<HolidayDto> findAll(boolean includeInactive) {
        List<HolidayCalendar> holidays = includeInactive
                ? holidayCalendarRepository.findAllByOrderByHolidayDateAsc()
                : holidayCalendarRepository.findAllByIsActiveTrueOrderByHolidayDateAsc();
        return holidays.stream().map(HolidayDto::from).toList();
    }

    public HolidayDto findById(Long id) {
        return holidayCalendarRepository.findById(id)
                .map(HolidayDto::from)
                .orElseThrow(() -> new EntityNotFoundException("Holiday not found: " + id));
    }

    public HolidayDto findByDate(LocalDate date) {
        return holidayCalendarRepository.findByHolidayDate(date)
                .map(HolidayDto::from)
                .orElseThrow(() -> new EntityNotFoundException("Holiday not found for date: " + date));
    }

    public HolidayDto create(UpsertHolidayRequest req) {
        if (holidayCalendarRepository.findByHolidayDate(req.holidayDate()).isPresent()) {
            throw new IllegalArgumentException("Holiday already exists for date: " + req.holidayDate());
        }

        HolidayCalendar holiday = HolidayCalendar.builder()
                .holidayDate(req.holidayDate())
                .name(req.name().trim())
                .holidayType(req.holidayType())
                .isTentative(Boolean.TRUE.equals(req.isTentative()))
                .isActive(req.isActive() == null || req.isActive())
                .build();

        return HolidayDto.from(holidayCalendarRepository.save(holiday));
    }

    public HolidayDto update(Long id, UpsertHolidayRequest req) {
        HolidayCalendar holiday = holidayCalendarRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Holiday not found: " + id));

        if (holidayCalendarRepository.existsByHolidayDateAndIdNot(req.holidayDate(), id)) {
            throw new IllegalArgumentException("Another holiday already exists for date: " + req.holidayDate());
        }

        holiday.setHolidayDate(req.holidayDate());
        holiday.setName(req.name().trim());
        holiday.setHolidayType(req.holidayType());
        holiday.setIsTentative(Boolean.TRUE.equals(req.isTentative()));
        holiday.setIsActive(req.isActive() == null || req.isActive());

        return HolidayDto.from(holidayCalendarRepository.save(holiday));
    }

    public HolidayDto deactivate(Long id) {
        HolidayCalendar holiday = holidayCalendarRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Holiday not found: " + id));

        holiday.setIsActive(false);
        return HolidayDto.from(holidayCalendarRepository.save(holiday));
    }
}
