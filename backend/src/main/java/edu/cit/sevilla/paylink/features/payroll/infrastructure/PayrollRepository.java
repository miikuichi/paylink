package edu.cit.sevilla.paylink.features.payroll.infrastructure;

import edu.cit.sevilla.paylink.features.payroll.domain.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    List<Payroll> findByPayPeriodIdOrderByCreatedAtAsc(Long payPeriodId);

    Optional<Payroll> findByEmployeeIdAndPayPeriodId(Long employeeId, Long payPeriodId);

    @Query("SELECT p FROM Payroll p WHERE p.employee.user.id = :userId ORDER BY p.createdAt DESC")
    List<Payroll> findByEmployeeUserId(@Param("userId") Long userId);
}
