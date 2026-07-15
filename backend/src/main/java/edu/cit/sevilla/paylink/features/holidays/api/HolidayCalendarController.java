package edu.cit.sevilla.paylink.features.holidays.api;

import edu.cit.sevilla.paylink.features.holidays.api.request.UpsertHolidayRequest;
import edu.cit.sevilla.paylink.features.holidays.api.response.HolidayDto;
import edu.cit.sevilla.paylink.features.holidays.application.HolidayCalendarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/holidays")
@RequiredArgsConstructor
public class HolidayCalendarController {

    private final HolidayCalendarService holidayCalendarService;

    @GetMapping
    public List<HolidayDto> findAll(@RequestParam(defaultValue = "false") boolean includeInactive) {
        return holidayCalendarService.findAll(includeInactive);
    }

    @GetMapping("/{id}")
    public HolidayDto findById(@PathVariable Long id) {
        return holidayCalendarService.findById(id);
    }

    @GetMapping("/by-date")
    public HolidayDto findByDate(@RequestParam LocalDate date) {
        return holidayCalendarService.findByDate(date);
    }

    @PostMapping
    public ResponseEntity<HolidayDto> create(@Valid @RequestBody UpsertHolidayRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(holidayCalendarService.create(req));
    }

    @PutMapping("/{id}")
    public HolidayDto update(@PathVariable Long id, @Valid @RequestBody UpsertHolidayRequest req) {
        return holidayCalendarService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public HolidayDto deactivate(@PathVariable Long id) {
        return holidayCalendarService.deactivate(id);
    }
}
