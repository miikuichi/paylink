package edu.cit.sevilla.paylink.features.payroll.application;

import edu.cit.sevilla.paylink.features.holidays.infrastructure.HolidayCalendarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Comprehensive Philippine Payroll Computation Service
 * 
 * Implements official government payroll calculations including:
 * - SSS, PhilHealth, Pag-IBIG, BIR withholding tax
 * - Overtime multipliers (TRAIN Law & Labor Code)
 * - Holiday pay (regular/special holidays)
 * - Night differential (10 PM - 6 AM)
 * 
 * References:
 * - SSS: 2024 Contribution Schedule
 * - PhilHealth: Circular 2023-006
 * - Pag-IBIG: Circular 2019-006
 * - BIR: RMO 16-2023 (TRAIN Law as amended by TRABAHO Act)
 * - DOLE: Labor Code & Wage Orders
 */
@Service
public class PayrollComputationService {

    private HolidayCalendarRepository holidayCalendarRepository;

    public PayrollComputationService() {
    }

    @Autowired
    public PayrollComputationService(HolidayCalendarRepository holidayCalendarRepository) {
        this.holidayCalendarRepository = holidayCalendarRepository;
    }

    /**
     * Computes gross pay for the pay period.
     * Basic pay is prorated from the monthly basic rate using actual calendar days.
     */
    public BigDecimal computeGrossPay(BigDecimal monthlyBasicRate, LocalDate start, LocalDate end,
            BigDecimal additionalAllowances) {
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        BigDecimal basicPay = monthlyBasicRate
                .multiply(BigDecimal.valueOf(days))
                .divide(PayrollConfiguration.DAYS_PER_MONTH, 2, RoundingMode.HALF_UP);
        return basicPay.add(additionalAllowances).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Computes gross pay including overtime hours.
     * 
     * @param monthlyBasicRate     Monthly salary base
     * @param regularHours         Hours worked during normal business hours
     * @param overtimeHours        Overtime hours (regular rate 125%)
     * @param additionalAllowances Allowances and bonuses
     * @return Gross pay including overtime compensation
     */
    public BigDecimal computeGrossPayWithOvertime(BigDecimal monthlyBasicRate, BigDecimal regularHours,
            BigDecimal overtimeHours, BigDecimal additionalAllowances) {
        BigDecimal hourlyRate = monthlyBasicRate
                .divide(PayrollConfiguration.HOURS_PER_MONTH, 10, RoundingMode.HALF_UP);

        BigDecimal regularPay = hourlyRate.multiply(regularHours);
        BigDecimal overtimePay = hourlyRate
                .multiply(PayrollConfiguration.OVERTIME_REGULAR_MULTIPLIER)
                .multiply(overtimeHours);

        return regularPay.add(overtimePay).add(additionalAllowances).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Computes holiday pay based on holiday type and work details.
     * 
     * @param dailyRate       Daily compensation rate
     * @param holidayType     Type: REGULAR or SPECIAL
     * @param workedOnHoliday True if employee worked on the holiday
     * @param isRestDay       True if the holiday falls on employee's rest day
     * @return Holiday pay amount
     */
    public BigDecimal computeHolidayPay(BigDecimal dailyRate, String holidayType,
            boolean workedOnHoliday, boolean isRestDay) {
        BigDecimal multiplier;

        if (!workedOnHoliday) {
            // Paid holiday - regular compensation only
            multiplier = "SPECIAL".equals(holidayType)
                    ? PayrollConfiguration.SPECIAL_HOLIDAY_PAY
                    : PayrollConfiguration.REGULAR_HOLIDAY_PAY;
        } else {
            // Worked on holiday
            if (isRestDay) {
                // Triple pay (200% if special, 300% if regular)
                multiplier = "SPECIAL".equals(holidayType)
                        ? new BigDecimal("2.00")
                        : new BigDecimal("3.00");
            } else {
                // Double or 150% pay
                multiplier = "SPECIAL".equals(holidayType)
                        ? PayrollConfiguration.WORK_ON_SPECIAL_HOLIDAY
                        : PayrollConfiguration.WORK_ON_REGULAR_HOLIDAY;
            }
        }

        return dailyRate.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Computes night differential pay (10 PM - 6 AM)
     * 
     * @param hourlyRate Hourly compensation rate
     * @param nightHours Hours worked during night shift
     * @return Night differential amount (10% additional)
     */
    public BigDecimal computeNightDifferential(BigDecimal hourlyRate, BigDecimal nightHours) {
        return hourlyRate
                .multiply(PayrollConfiguration.NIGHT_DIFFERENTIAL_RATE)
                .multiply(nightHours)
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Returns ordered map of statutory deduction label → prorated amount for the
     * pay period. Uses official government contribution tables.
     */
    public Map<String, BigDecimal> computeStatutoryDeductions(BigDecimal monthlyBasicRate,
            LocalDate start, LocalDate end) {
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        BigDecimal ratio = BigDecimal.valueOf(days)
                .divide(PayrollConfiguration.DAYS_PER_MONTH, 10, RoundingMode.HALF_UP);

        BigDecimal sss = computeSSSContribution(monthlyBasicRate).multiply(ratio)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal philhealth = computePhilHealthContribution(monthlyBasicRate).multiply(ratio)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal pagibig = computePagIBIGContribution(monthlyBasicRate).multiply(ratio)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal tax = computeWithholdingTax(monthlyBasicRate,
                computeSSSContribution(monthlyBasicRate),
                computePhilHealthContribution(monthlyBasicRate),
                computePagIBIGContribution(monthlyBasicRate))
                .multiply(ratio).setScale(2, RoundingMode.HALF_UP);

        Map<String, BigDecimal> result = new LinkedHashMap<>();
        result.put("SSS Contribution", sss);
        result.put("PhilHealth Contribution", philhealth);
        result.put("Pag-IBIG Contribution", pagibig);
        result.put("Withholding Tax", tax);
        return result;
    }

    // ==================== CONTRIBUTION HELPERS ====================

    /**
     * Computes SSS employee contribution using official 2024 contribution table.
     * MSC Range: ₱4,250 - ₱30,000 (rounded to nearest ₱500)
     * Rate: 4.5% of MSC
     */
    private BigDecimal computeSSSContribution(BigDecimal salary) {
        double salaryAmount = salary.doubleValue();
        double msc = Math.max(4250, Math.min(30000, salaryAmount));

        // Round to nearest ₱500 bracket
        long rounded = Math.round(msc / 500.0) * 500L;
        rounded = Math.max(4500L, Math.min(30000L, rounded));

        // Use official contribution table if available
        String bracketKey = String.valueOf(rounded);
        if (PayrollConfiguration.SSS_CONTRIBUTION_TABLE.containsKey(bracketKey)) {
            return PayrollConfiguration.SSS_CONTRIBUTION_TABLE.get(bracketKey);
        }

        // Fallback: calculate as 4.5% of MSC
        return BigDecimal.valueOf(rounded)
                .multiply(PayrollConfiguration.SSS_EMPLOYEE_RATE)
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Computes PhilHealth employee contribution.
     * Rate: 2.5% of basic salary
     * MSC Clipped: ₱10,000 - ₱100,000
     */
    private BigDecimal computePhilHealthContribution(BigDecimal salary) {
        double salaryAmount = salary.doubleValue();
        double clipped = Math.max(10000, Math.min(100000, salaryAmount));

        return BigDecimal.valueOf(clipped)
                .multiply(PayrollConfiguration.PHILHEALTH_EMPLOYEE_RATE)
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Computes Pag-IBIG employee contribution.
     * Rate: 1% if salary ≤ ₱1,500; 2% if > ₱1,500
     * Monthly Cap: ₱100
     */
    private BigDecimal computePagIBIGContribution(BigDecimal salary) {
        double s = salary.doubleValue();
        double contribution = (s <= 1500)
                ? s * PayrollConfiguration.PAGIBIG_LOWER_RATE.doubleValue()
                : Math.min(s * PayrollConfiguration.PAGIBIG_UPPER_RATE.doubleValue(),
                        PayrollConfiguration.PAGIBIG_MONTHLY_CAP.doubleValue());

        return BigDecimal.valueOf(contribution).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Computes BIR withholding tax using official TRAIN Law 2024 brackets.
     * Taxable income = gross salary − SSS − PhilHealth − Pag-IBIG
     */
    private BigDecimal computeWithholdingTax(BigDecimal salary,
            BigDecimal sss, BigDecimal philhealth, BigDecimal pagibig) {
        double taxable = salary.subtract(sss).subtract(philhealth).subtract(pagibig).doubleValue();
        if (taxable <= 0)
            return BigDecimal.ZERO;

        double tax = 0;

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

    /**
     * Checks if a given date is a Philippine holiday
     */
    public boolean isHoliday(LocalDate date) {
        return isHoliday(date, false);
    }

    /**
     * Checks if a date is a holiday, optionally including tentative entries.
     */
    public boolean isHoliday(LocalDate date, boolean includeTentative) {
        if (holidayCalendarRepository == null) {
            return false;
        }
        return includeTentative
                ? holidayCalendarRepository.existsByHolidayDateAndIsActiveTrue(date)
                : holidayCalendarRepository.existsByHolidayDateAndIsActiveTrueAndIsTentativeFalse(date);
    }
}
