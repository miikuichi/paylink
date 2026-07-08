package edu.cit.sevilla.paylink.features.payperiods.application;

import edu.cit.sevilla.paylink.enums.PayPeriodStatus;
import edu.cit.sevilla.paylink.features.payperiods.api.request.CreatePayPeriodRequest;
import edu.cit.sevilla.paylink.features.payperiods.api.response.PayPeriodDto;
import edu.cit.sevilla.paylink.features.payperiods.domain.PayPeriod;
import edu.cit.sevilla.paylink.features.payperiods.infrastructure.PayPeriodRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PayPeriodService {

    private final PayPeriodRepository payPeriodRepository;

    public List<PayPeriodDto> findAll() {
        return payPeriodRepository.findAllByOrderByStartDateDesc().stream()
                .map(PayPeriodDto::from).toList();
    }

    public PayPeriodDto findById(Long id) {
        return payPeriodRepository.findById(id)
                .map(PayPeriodDto::from)
                .orElseThrow(() -> new EntityNotFoundException("Pay period not found: " + id));
    }

    public PayPeriodDto create(CreatePayPeriodRequest req) {
        if (req.endDate().isBefore(req.startDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }
        return PayPeriodDto.from(payPeriodRepository.save(PayPeriod.builder()
                .startDate(req.startDate())
                .endDate(req.endDate())
                .status(PayPeriodStatus.OPEN)
                .build()));
    }

    public PayPeriodDto updateStatus(Long id, PayPeriodStatus status) {
        PayPeriod period = payPeriodRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pay period not found: " + id));
        period.setStatus(status);
        return PayPeriodDto.from(payPeriodRepository.save(period));
    }
}
