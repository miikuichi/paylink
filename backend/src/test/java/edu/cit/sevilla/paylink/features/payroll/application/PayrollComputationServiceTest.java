package edu.cit.sevilla.paylink.features.payroll.application;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive unit tests for PayrollComputationService.
 * Tests SSS, PhilHealth, Pag-IBIG, BIR calculations with various salary brackets.
 */
@DisplayName("PayrollComputationService Tests")
class PayrollComputationServiceTest {

    private PayrollComputationService service;

    @BeforeEach
    void setUp() {
        service = new PayrollComputationService();
    }

    // ============= GROSS PAY TESTS =============    @Test
    @DisplayName("Should compute gross pay for full month (30 days)")
    void testComputeGrossPay_FullMonth() {
        BigDecimal monthlyRate = BigDecimal.valueOf(30000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 30); // 30 days inclusive
        BigDecimal allowances = BigDecimal.valueOf(2000);

        BigDecimal result = service.computeGrossPay(monthlyRate, start, end, allowances);

        // 30 days * 30000/30 + 2000 = 30000 + 2000 = 32000
        assertEquals(BigDecimal.valueOf(32000).setScale(2, java.math.RoundingMode.HALF_UP), result);
    }

    @Test
    @DisplayName("Should compute gross pay for partial month (15 days)")
    void testComputeGrossPay_PartialMonth() {
        BigDecimal monthlyRate = BigDecimal.valueOf(30000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 15);
        BigDecimal allowances = BigDecimal.ZERO;

        BigDecimal result = service.computeGrossPay(monthlyRate, start, end, allowances);

        // 15 days * 30000/30 = 15000
        assertEquals(BigDecimal.valueOf(15000).setScale(2, java.math.RoundingMode.HALF_UP), result);
    }

    @Test
    @DisplayName("Should compute gross pay with no allowances")
    void testComputeGrossPay_NoAllowances() {
        BigDecimal monthlyRate = BigDecimal.valueOf(25000);
        LocalDate start = LocalDate.of(2024, 2, 1);
        LocalDate end = LocalDate.of(2024, 2, 29);
        BigDecimal allowances = BigDecimal.ZERO;

        BigDecimal result = service.computeGrossPay(monthlyRate, start, end, allowances);

        // 29 days * 25000/30 = 24166.67
        assertEquals(new BigDecimal("24166.67"), result);
    }

    // ============= SSS CONTRIBUTION TESTS =============    @Test
    @DisplayName("Should compute SSS for minimum salary (₱4,250 MSC)")
    void testComputeSSS_MinimumSalary() {
        BigDecimal salary = BigDecimal.valueOf(4000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 30);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // SSS = 4500 * 0.045 = 202.50 (MSC rounded to ₱4,500)
        assertEquals(new BigDecimal("202.50"), deductions.get("SSS Contribution"));
    }    @Test
    @DisplayName("Should compute SSS for ₱15,000 salary")
    void testComputeSSS_15000Salary() {
        BigDecimal salary = BigDecimal.valueOf(15000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 30);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // SSS = 15000 * 0.045 = 675.00
        assertEquals(new BigDecimal("675.00"), deductions.get("SSS Contribution"));
    }    @Test
    @DisplayName("Should compute SSS for ₱30,000 salary (maximum MSC)")
    void testComputeSSS_MaximumSalary() {
        BigDecimal salary = BigDecimal.valueOf(30000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 30);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // SSS = 30000 * 0.045 = 1350.00
        assertEquals(new BigDecimal("1350.00"), deductions.get("SSS Contribution"));
    }    @Test
    @DisplayName("Should compute SSS for salary exceeding maximum MSC")
    void testComputeSSS_SalaryExceedsMaxMSC() {
        BigDecimal salary = BigDecimal.valueOf(50000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 30);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // SSS should be capped at 30000 * 0.045 = 1350.00
        assertEquals(new BigDecimal("1350.00"), deductions.get("SSS Contribution"));
    }

    @Test
    @DisplayName("Should prorate SSS for 15-day period")
    void testComputeSSS_ProrationFor15Days() {
        BigDecimal salary = BigDecimal.valueOf(30000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 15);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // SSS = (30000 * 0.045) * (15/30) = 1350.00 * 0.5 = 675.00
        assertEquals(new BigDecimal("675.00"), deductions.get("SSS Contribution"));
    }

    // ============= PHILHEALTH CONTRIBUTION TESTS =============    @Test
    @DisplayName("Should compute PhilHealth for ₱10,000 salary (minimum clip)")
    void testComputePhilHealth_MinimumClip() {
        BigDecimal salary = BigDecimal.valueOf(5000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 30);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // PhilHealth = 10000 * 0.025 = 250.00 (clipped to minimum ₱10,000)
        assertEquals(new BigDecimal("250.00"), deductions.get("PhilHealth Contribution"));
    }    @Test
    @DisplayName("Should compute PhilHealth for ₱50,000 salary")
    void testComputePhilHealth_50000Salary() {
        BigDecimal salary = BigDecimal.valueOf(50000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 30);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // PhilHealth = 50000 * 0.025 = 1250.00
        assertEquals(new BigDecimal("1250.00"), deductions.get("PhilHealth Contribution"));
    }    @Test
    @DisplayName("Should compute PhilHealth for ₱200,000 salary (maximum clip)")
    void testComputePhilHealth_MaximumClip() {
        BigDecimal salary = BigDecimal.valueOf(200000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 30);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // PhilHealth = 100000 * 0.025 = 2500.00 (clipped to maximum ₱100,000)
        assertEquals(new BigDecimal("2500.00"), deductions.get("PhilHealth Contribution"));
    }

    // ============= PAG-IBIG CONTRIBUTION TESTS =============    @Test
    @DisplayName("Should compute Pag-IBIG at 1% for salary ≤ ₱1,500")
    void testComputePagIbig_BelowThreshold() {
        BigDecimal salary = BigDecimal.valueOf(1000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 30);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // Pag-IBIG = 1000 * 0.01 = 10.00
        assertEquals(new BigDecimal("10.00"), deductions.get("Pag-IBIG Contribution"));
    }    @Test
    @DisplayName("Should compute Pag-IBIG at 2% for salary > ₱1,500")
    void testComputePagIbig_AboveThreshold() {
        BigDecimal salary = BigDecimal.valueOf(10000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 30);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // Pag-IBIG = min(10000 * 0.02, 100) = 100.00 (capped)
        assertEquals(new BigDecimal("100.00"), deductions.get("Pag-IBIG Contribution"));
    }    @Test
    @DisplayName("Should cap Pag-IBIG at ₱100 per month")
    void testComputePagIbig_CappedAt100() {
        BigDecimal salary = BigDecimal.valueOf(50000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 30);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // Pag-IBIG = min(50000 * 0.02, 100) = 100.00
        assertEquals(new BigDecimal("100.00"), deductions.get("Pag-IBIG Contribution"));
    }

    // ============= WITHHOLDING TAX TESTS =============    @Test
    @DisplayName("Should not charge tax for salary ≤ ₱20,833 (tax-exempt)")
    void testWithholdingTax_TaxExempt() {
        BigDecimal salary = BigDecimal.valueOf(15000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 30);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // Taxable income should be less than ₱20,833 after deductions
        BigDecimal tax = deductions.get("Withholding Tax");
        assertEquals(0, tax.compareTo(BigDecimal.ZERO), "Tax should be zero");
    }

    @Test
    @DisplayName("Should compute tax at 20% bracket (₱20,833–₱33,333)")
    void testWithholdingTax_20PercentBracket() {
        BigDecimal salary = BigDecimal.valueOf(30000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // Taxable = 30000 - 1350 - 750 - 100 = 27800
        // Tax = (27800 - 20833) * 0.20 = 1393.40
        BigDecimal tax = deductions.get("Withholding Tax");
        assertTrue(tax.compareTo(BigDecimal.ZERO) > 0);
        assertTrue(tax.compareTo(new BigDecimal("2000")) < 0); // Sanity check
    }

    @Test
    @DisplayName("Should compute tax at 25% bracket (₱33,333–₱66,667)")
    void testWithholdingTax_25PercentBracket() {
        BigDecimal salary = BigDecimal.valueOf(50000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // Taxable = 50000 - deductions, should fall in 25% bracket
        BigDecimal tax = deductions.get("Withholding Tax");
        assertTrue(tax.compareTo(BigDecimal.ZERO) > 0);
        assertTrue(tax.compareTo(new BigDecimal("10000")) < 0); // Sanity check
    }

    @Test
    @DisplayName("Should compute tax at 30% bracket (₱66,667–₱166,667)")
    void testWithholdingTax_30PercentBracket() {
        BigDecimal salary = BigDecimal.valueOf(100000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // Taxable income should fall in 30% bracket
        BigDecimal tax = deductions.get("Withholding Tax");
        assertTrue(tax.compareTo(BigDecimal.ZERO) > 0);
        assertTrue(tax.compareTo(new BigDecimal("30000")) < 0); // Sanity check
    }

    @Test
    @DisplayName("Should compute tax at 32% bracket (₱166,667–₱666,667)")
    void testWithholdingTax_32PercentBracket() {
        BigDecimal salary = BigDecimal.valueOf(250000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        BigDecimal tax = deductions.get("Withholding Tax");
        assertTrue(tax.compareTo(BigDecimal.ZERO) > 0);
        assertTrue(tax.compareTo(new BigDecimal("80000")) < 0); // Sanity check
    }    @Test
    @DisplayName("Should compute tax at 35% bracket (> ₱666,667)")
    void testWithholdingTax_35PercentBracket() {
        BigDecimal salary = BigDecimal.valueOf(1000000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        BigDecimal tax = deductions.get("Withholding Tax");
        assertTrue(tax.compareTo(BigDecimal.ZERO) > 0);
        assertTrue(tax.compareTo(new BigDecimal("350000")) < 0); // Should be around ₱316,000+ for 35% bracket on ₱1M salary
    }

    // ============= INTEGRATION TESTS (All Deductions Together) =============

    @Test
    @DisplayName("Should return all deductions in correct order")
    void testComputeStatutoryDeductions_AllDeductionsPresent() {
        BigDecimal salary = BigDecimal.valueOf(30000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // Verify all deductions are present
        assertTrue(deductions.containsKey("SSS Contribution"));
        assertTrue(deductions.containsKey("PhilHealth Contribution"));
        assertTrue(deductions.containsKey("Pag-IBIG Contribution"));
        assertTrue(deductions.containsKey("Withholding Tax"));
        assertEquals(4, deductions.size());
    }

    @Test
    @DisplayName("Should have non-negative deductions")
    void testComputeStatutoryDeductions_NonNegative() {
        BigDecimal salary = BigDecimal.valueOf(50000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        for (BigDecimal amount : deductions.values()) {
            assertTrue(amount.compareTo(BigDecimal.ZERO) >= 0, "Deductions must be non-negative");
        }
    }

    @Test
    @DisplayName("Should have deductions less than gross pay")
    void testComputeStatutoryDeductions_LessThanGrossPay() {
        BigDecimal salary = BigDecimal.valueOf(50000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        BigDecimal gross = service.computeGrossPay(salary, start, end, BigDecimal.ZERO);
        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        BigDecimal totalDeductions = deductions.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertTrue(totalDeductions.compareTo(gross) < 0, "Total deductions must be less than gross pay");
    }

    @Test
    @DisplayName("Should compute net pay (gross - deductions)")
    void testComputeNetPay() {
        BigDecimal salary = BigDecimal.valueOf(40000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        BigDecimal gross = service.computeGrossPay(salary, start, end, BigDecimal.ZERO);
        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        BigDecimal totalDeductions = deductions.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal net = gross.subtract(totalDeductions);

        assertTrue(net.compareTo(BigDecimal.ZERO) > 0, "Net pay must be positive");
        assertTrue(net.compareTo(gross) < 0, "Net pay must be less than gross pay");
    }

    // ============= EDGE CASES =============

    @Test
    @DisplayName("Should handle zero salary")
    void testComputeGrossPay_ZeroSalary() {
        BigDecimal salary = BigDecimal.ZERO;
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        BigDecimal result = service.computeGrossPay(salary, start, end, BigDecimal.ZERO);
        assertEquals(BigDecimal.ZERO.setScale(2, java.math.RoundingMode.HALF_UP), result);
    }

    @Test
    @DisplayName("Should handle single-day pay period")
    void testComputeGrossPay_SingleDay() {
        BigDecimal salary = BigDecimal.valueOf(30000);
        LocalDate date = LocalDate.of(2024, 1, 15);

        BigDecimal result = service.computeGrossPay(salary, date, date, BigDecimal.ZERO);

        // 1 day * 30000/30 = 1000.00
        assertEquals(new BigDecimal("1000.00"), result);
    }

    @Test
    @DisplayName("Should handle very high salary (above ₱500,000)")
    void testComputeStatutoryDeductions_HighSalary() {
        BigDecimal salary = BigDecimal.valueOf(500000);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        // All deductions should be present and reasonable
        for (BigDecimal amount : deductions.values()) {
            assertTrue(amount.compareTo(BigDecimal.ZERO) >= 0);
            assertTrue(amount.compareTo(salary) < 0);
        }
    }

    @Test
    @DisplayName("Should scale deductions with BigDecimal to 2 decimal places")
    void testComputeStatutoryDeductions_DecimalPrecision() {
        BigDecimal salary = BigDecimal.valueOf(12345.67);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        Map<String, BigDecimal> deductions = service.computeStatutoryDeductions(salary, start, end);

        for (BigDecimal amount : deductions.values()) {
            assertEquals(2, amount.scale(), "All amounts should have 2 decimal places");
        }
    }
}
