package edu.cit.sevilla.paylink.features.payroll.domain;

import edu.cit.sevilla.paylink.enums.PayrollStatus;
import edu.cit.sevilla.paylink.entity.Payslip;
import edu.cit.sevilla.paylink.entity.User;
import edu.cit.sevilla.paylink.features.employees.domain.Employee;
import edu.cit.sevilla.paylink.features.payperiods.domain.PayPeriod;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payrolls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pay_period_id", nullable = false)
    private PayPeriod payPeriod;

    @Column(name = "gross_pay", nullable = false, precision = 12, scale = 2)
    private BigDecimal grossPay;

    @Column(name = "total_allowances", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAllowances;

    @Column(name = "total_deductions", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalDeductions;

    @Column(name = "net_pay", nullable = false, precision = 12, scale = 2)
    private BigDecimal netPay;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PayrollStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "payroll", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PayrollItem> items = new ArrayList<>();

    @OneToOne(mappedBy = "payroll", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Payslip payslip;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null)
            this.status = PayrollStatus.DRAFT;
        if (this.grossPay == null)
            this.grossPay = BigDecimal.ZERO;
        if (this.totalAllowances == null)
            this.totalAllowances = BigDecimal.ZERO;
        if (this.totalDeductions == null)
            this.totalDeductions = BigDecimal.ZERO;
        if (this.netPay == null)
            this.netPay = BigDecimal.ZERO;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
