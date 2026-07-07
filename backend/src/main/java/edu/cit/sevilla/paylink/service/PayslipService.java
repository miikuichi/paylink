package edu.cit.sevilla.paylink.service;

import edu.cit.sevilla.paylink.dto.PayslipDto;
import edu.cit.sevilla.paylink.entity.Payslip;
import edu.cit.sevilla.paylink.enums.PayrollStatus;
import edu.cit.sevilla.paylink.features.payroll.domain.Payroll;
import edu.cit.sevilla.paylink.features.payroll.infrastructure.PayrollRepository;
import edu.cit.sevilla.paylink.repository.PayslipRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PayslipService {

    private final PayslipRepository payslipRepository;
    private final PayrollRepository payrollRepository;

    @Transactional(readOnly = true)
    public List<PayslipDto> findByEmployeeUserId(Long userId) {
        return payslipRepository.findByEmployeeUserId(userId).stream().map(PayslipDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<PayslipDto> findByPayPeriod(Long payPeriodId) {
        return payslipRepository.findByPayPeriodId(payPeriodId).stream().map(PayslipDto::from).toList();
    }

    @Transactional(readOnly = true)
    public PayslipDto findById(Long id) {
        return payslipRepository.findById(id)
                .map(PayslipDto::from)
                .orElseThrow(() -> new EntityNotFoundException("Payslip not found: " + id));
    }

    @Transactional
    public PayslipDto generate(Long payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new EntityNotFoundException("Payroll not found: " + payrollId));

        if (payroll.getStatus() != PayrollStatus.PROCESSED) {
            throw new IllegalStateException("Payslip can only be generated for a processed payroll");
        }

        payslipRepository.findByPayrollId(payrollId).ifPresent(e -> {
            throw new IllegalStateException("Payslip already exists for payroll " + payrollId);
        });

        return PayslipDto.from(payslipRepository.save(Payslip.builder().payroll(payroll).build()));
    }
}
