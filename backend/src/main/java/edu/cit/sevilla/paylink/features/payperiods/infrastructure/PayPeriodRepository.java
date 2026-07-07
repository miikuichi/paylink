package edu.cit.sevilla.paylink.features.payperiods.infrastructure;

import edu.cit.sevilla.paylink.features.payperiods.domain.PayPeriod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayPeriodRepository extends JpaRepository<PayPeriod, Long> {
    List<PayPeriod> findAllByOrderByStartDateDesc();
}
