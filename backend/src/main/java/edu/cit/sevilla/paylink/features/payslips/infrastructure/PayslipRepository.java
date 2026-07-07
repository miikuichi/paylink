package edu.cit.sevilla.paylink.features.payslips.infrastructure;

import edu.cit.sevilla.paylink.features.payslips.domain.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PayslipRepository extends JpaRepository<Payslip, Long> {

    Optional<Payslip> findByPayrollId(Long payrollId);

    @Query("SELECT s FROM Payslip s WHERE s.payroll.employee.user.id = :userId ORDER BY s.issuedAt DESC")
    List<Payslip> findByEmployeeUserId(@Param("userId") Long userId);

    @Query("SELECT s FROM Payslip s WHERE s.payroll.payPeriod.id = :payPeriodId ORDER BY s.issuedAt DESC")
    List<Payslip> findByPayPeriodId(@Param("payPeriodId") Long payPeriodId);
}
