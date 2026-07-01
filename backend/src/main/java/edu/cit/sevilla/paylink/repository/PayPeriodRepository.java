package edu.cit.sevilla.paylink.repository;

import edu.cit.sevilla.paylink.entity.PayPeriod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayPeriodRepository extends JpaRepository<PayPeriod, Long> {
    List<PayPeriod> findAllByOrderByStartDateDesc();
}
