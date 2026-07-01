package edu.cit.sevilla.paylink.repository;

import edu.cit.sevilla.paylink.entity.PayrollItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayrollItemRepository extends JpaRepository<PayrollItem, Long> {
}
