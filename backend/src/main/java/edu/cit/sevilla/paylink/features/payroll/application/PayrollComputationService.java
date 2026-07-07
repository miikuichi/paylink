package edu.cit.sevilla.paylink.features.payroll.application;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Computes Philippine statutory payroll deductions.
 *
 * References:
 * - SSS: 2024 contribution table (employee rate 4.5% of MSC, max MSC ₱30,000)
 * - PhilHealth: Circular 2023-006 (employee share 2.5% of basic, cap ₱100,000
 * MSC)
 * - Pag-IBIG/HDMF: Circular 2019-006 (employee 2% capped at ₱100/month)
 * - BIR: TRAIN Law 2023 monthly withholding tax table
 */
@Service
public class PayrollComputationService {

    /**
     * Computes gross pay for the pay period.
     * Basic pay is prorated from the monthly basic rate using calendar days / 30.
     */
    public BigDecimal computeGrossPay(BigDecimal monthlyBasicRate, LocalDate start, LocalDate end,
            BigDecimal additionalAllowances) {
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        BigDecimal basicPay = monthlyBasicRate
                .multiply(BigDecimal.valueOf(days))
                .divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
        return basicPay.add(additionalAllowances).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Returns ordered map of statutory deduction label → prorated amount for the
     * pay period.
     */
    public Map<String, BigDecimal> computeStatutoryDeductions(BigDecimal monthlyBasicRate,
            LocalDate start, LocalDate end) {
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        BigDecimal ratio = BigDecimal.valueOf(days).divide(BigDecimal.valueOf(30), 10, RoundingMode.HALF_UP);

        BigDecimal sss = sssMonthly(monthlyBasicRate).multiply(ratio).setScale(2, RoundingMode.HALF_UP);
        BigDecimal philhealth = philhealthMonthly(monthlyBasicRate).multiply(ratio).setScale(2, RoundingMode.HALF_UP);
        BigDecimal pagibig = pagibigMonthly(monthlyBasicRate).multiply(ratio).setScale(2, RoundingMode.HALF_UP);
        BigDecimal tax = withholdingTax(monthlyBasicRate,
                sssMonthly(monthlyBasicRate),
                philhealthMonthly(monthlyBasicRate),
                pagibigMonthly(monthlyBasicRate))
                .multiply(ratio).setScale(2, RoundingMode.HALF_UP);

        Map<String, BigDecimal> result = new LinkedHashMap<>();
        result.put("SSS Contribution", sss);
        result.put("PhilHealth Contribution", philhealth);
        result.put("Pag-IBIG Contribution", pagibig);
        result.put("Withholding Tax", tax);
        return result;
    }

    // ----- Private computation helpers -----

    /**
     * SSS 2024: employee = 4.5% of Monthly Salary Credit, MSC range ₱4,250–₱30,000.
     */
    private BigDecimal sssMonthly(BigDecimal salary) {
        double msc = Math.max(4250, Math.min(30000, salary.doubleValue()));
        // Round MSC to nearest ₱500 bracket
        long rounded = Math.round(msc / 500.0) * 500L;
        rounded = Math.max(4500L, Math.min(30000L, rounded));
        return BigDecimal.valueOf(rounded * 0.045).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * PhilHealth 2024: employee share = 2.5% of basic salary, clipped to
     * ₱10,000–₱100,000.
     */
    private BigDecimal philhealthMonthly(BigDecimal salary) {
        double clipped = Math.max(10000, Math.min(100000, salary.doubleValue()));
        return BigDecimal.valueOf(clipped * 0.025).setScale(2, RoundingMode.HALF_UP);
    }

    /** Pag-IBIG: employee = 2% of salary if > ₱1,500, capped at ₱100; else 1%. */
    private BigDecimal pagibigMonthly(BigDecimal salary) {
        double s = salary.doubleValue();
        double contribution = (s <= 1500) ? s * 0.01 : Math.min(s * 0.02, 100.0);
        return BigDecimal.valueOf(contribution).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * BIR TRAIN Law withholding tax (monthly table, 2023).
     * Taxable income = gross monthly salary − SSS − PhilHealth − Pag-IBIG.
     */
    private BigDecimal withholdingTax(BigDecimal salary,
            BigDecimal sss, BigDecimal philhealth, BigDecimal pagibig) {
        double taxable = salary.subtract(sss).subtract(philhealth).subtract(pagibig).doubleValue();
        if (taxable <= 0)
            return BigDecimal.ZERO;

        double tax;
        if (taxable <= 20833) {
            tax = 0;
        } else if (taxable <= 33333) {
            tax = (taxable - 20833) * 0.20;
        } else if (taxable <= 66667) {
            tax = 2500 + (taxable - 33333) * 0.25;
        } else if (taxable <= 166667) {
            tax = 10833.33 + (taxable - 66667) * 0.30;
        } else if (taxable <= 666667) {
            tax = 40833.33 + (taxable - 166667) * 0.32;
        } else {
            tax = 200833.33 + (taxable - 666667) * 0.35;
        }

        return BigDecimal.valueOf(tax).setScale(2, RoundingMode.HALF_UP);
    }
}
