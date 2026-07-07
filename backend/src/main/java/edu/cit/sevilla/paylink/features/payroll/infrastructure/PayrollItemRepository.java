package edu.cit.sevilla.paylink.features.payroll.infrastructure;

import edu.cit.sevilla.paylink.features.payroll.domain.PayrollItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayrollItemRepository extends JpaRepository<PayrollItem, Long> {
}
