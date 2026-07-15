package edu.cit.sevilla.paylink.features.payroll.application;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Philippine Government Payroll Configuration
 * 
 * Official Sources:
 * - SSS: https://www.sss.gov.ph (2024 Contribution Schedule)
 * - PhilHealth: https://www.philhealth.gov.ph (Circular 2023-006)
 * - Pag-IBIG: https://www.pagibig.gov.ph (Circular 2019-006)
 * - BIR: https://www.bir.gov.ph (TRAIN Law as amended by TRABAHO Act)
 * - DOLE: https://www.dole.gov.ph (Labor Code & Wage Orders)
 */
public class PayrollConfiguration {

    // ==================== SSS CONTRIBUTION TABLE 2024 ====================
    // Employee Rate: Fixed at 4.5% of Monthly Salary Credit (MSC)
    // Employer Rate: 11.5% of MSC
    // MSC Range: ₱4,250 - ₱30,000 (rounded to nearest ₱500)
    // Reference: SSS 2024 Contribution Table
    
    public static final BigDecimal SSS_EMPLOYEE_RATE = new BigDecimal("0.045");
    public static final BigDecimal SSS_EMPLOYER_RATE = new BigDecimal("0.115");
    public static final BigDecimal SSS_MINIMUM_MSC = new BigDecimal("4250");
    public static final BigDecimal SSS_MAXIMUM_MSC = new BigDecimal("30000");
    
    // SSS 2024 Contribution Table (Employee Share by MSC)
    public static final Map<String, BigDecimal> SSS_CONTRIBUTION_TABLE = new HashMap<>();
    static {
        // Format: MSC Range Upper Bound -> Employee Contribution
        SSS_CONTRIBUTION_TABLE.put("4500", new BigDecimal("202.50"));    // ₱4,250-₱4,749.99
        SSS_CONTRIBUTION_TABLE.put("5000", new BigDecimal("225.00"));    // ₱4,750-₱5,249.99
        SSS_CONTRIBUTION_TABLE.put("5500", new BigDecimal("247.50"));    // ₱5,250-₱5,749.99
        SSS_CONTRIBUTION_TABLE.put("6000", new BigDecimal("270.00"));    // ₱5,750-₱6,249.99
        SSS_CONTRIBUTION_TABLE.put("6500", new BigDecimal("292.50"));    // ₱6,250-₱6,749.99
        SSS_CONTRIBUTION_TABLE.put("7000", new BigDecimal("315.00"));    // ₱6,750-₱7,249.99
        SSS_CONTRIBUTION_TABLE.put("7500", new BigDecimal("337.50"));    // ₱7,250-₱7,749.99
        SSS_CONTRIBUTION_TABLE.put("8000", new BigDecimal("360.00"));    // ₱7,750-₱8,249.99
        SSS_CONTRIBUTION_TABLE.put("8500", new BigDecimal("382.50"));    // ₱8,250-₱8,749.99
        SSS_CONTRIBUTION_TABLE.put("9000", new BigDecimal("405.00"));    // ₱8,750-₱9,249.99
        SSS_CONTRIBUTION_TABLE.put("9500", new BigDecimal("427.50"));    // ₱9,250-₱9,749.99
        SSS_CONTRIBUTION_TABLE.put("10000", new BigDecimal("450.00"));   // ₱9,750-₱10,249.99
        SSS_CONTRIBUTION_TABLE.put("10500", new BigDecimal("472.50"));   // ₱10,250-₱10,749.99
        SSS_CONTRIBUTION_TABLE.put("11000", new BigDecimal("495.00"));   // ₱10,750-₱11,249.99
        SSS_CONTRIBUTION_TABLE.put("11500", new BigDecimal("517.50"));   // ₱11,250-₱11,749.99
        SSS_CONTRIBUTION_TABLE.put("12000", new BigDecimal("540.00"));   // ₱11,750-₱12,249.99
        SSS_CONTRIBUTION_TABLE.put("12500", new BigDecimal("562.50"));   // ₱12,250-₱12,749.99
        SSS_CONTRIBUTION_TABLE.put("13000", new BigDecimal("585.00"));   // ₱12,750-₱13,249.99
        SSS_CONTRIBUTION_TABLE.put("13500", new BigDecimal("607.50"));   // ₱13,250-₱13,749.99
        SSS_CONTRIBUTION_TABLE.put("14000", new BigDecimal("630.00"));   // ₱13,750-₱14,249.99
        SSS_CONTRIBUTION_TABLE.put("14500", new BigDecimal("652.50"));   // ₱14,250-₱14,749.99
        SSS_CONTRIBUTION_TABLE.put("15000", new BigDecimal("675.00"));   // ₱14,750-₱15,249.99
        SSS_CONTRIBUTION_TABLE.put("15500", new BigDecimal("697.50"));   // ₱15,250-₱15,749.99
        SSS_CONTRIBUTION_TABLE.put("16000", new BigDecimal("720.00"));   // ₱15,750-₱16,249.99
        SSS_CONTRIBUTION_TABLE.put("16500", new BigDecimal("742.50"));   // ₱16,250-₱16,749.99
        SSS_CONTRIBUTION_TABLE.put("17000", new BigDecimal("765.00"));   // ₱16,750-₱17,249.99
        SSS_CONTRIBUTION_TABLE.put("17500", new BigDecimal("787.50"));   // ₱17,250-₱17,749.99
        SSS_CONTRIBUTION_TABLE.put("18000", new BigDecimal("810.00"));   // ₱17,750-₱18,249.99
        SSS_CONTRIBUTION_TABLE.put("18500", new BigDecimal("832.50"));   // ₱18,250-₱18,749.99
        SSS_CONTRIBUTION_TABLE.put("19000", new BigDecimal("855.00"));   // ₱18,750-₱19,249.99
        SSS_CONTRIBUTION_TABLE.put("19500", new BigDecimal("877.50"));   // ₱19,250-₱19,749.99
        SSS_CONTRIBUTION_TABLE.put("20000", new BigDecimal("900.00"));   // ₱19,750-₱20,249.99
        SSS_CONTRIBUTION_TABLE.put("20500", new BigDecimal("922.50"));   // ₱20,250-₱20,749.99
        SSS_CONTRIBUTION_TABLE.put("21000", new BigDecimal("945.00"));   // ₱20,750-₱21,249.99
        SSS_CONTRIBUTION_TABLE.put("21500", new BigDecimal("967.50"));   // ₱21,250-₱21,749.99
        SSS_CONTRIBUTION_TABLE.put("22000", new BigDecimal("990.00"));   // ₱21,750-₱22,249.99
        SSS_CONTRIBUTION_TABLE.put("22500", new BigDecimal("1012.50")); // ₱22,250-₱22,749.99
        SSS_CONTRIBUTION_TABLE.put("23000", new BigDecimal("1035.00")); // ₱22,750-₱23,249.99
        SSS_CONTRIBUTION_TABLE.put("23500", new BigDecimal("1057.50")); // ₱23,250-₱23,749.99
        SSS_CONTRIBUTION_TABLE.put("24000", new BigDecimal("1080.00")); // ₱23,750-₱24,249.99
        SSS_CONTRIBUTION_TABLE.put("24500", new BigDecimal("1102.50")); // ₱24,250-₱24,749.99
        SSS_CONTRIBUTION_TABLE.put("25000", new BigDecimal("1125.00")); // ₱24,750-₱25,249.99
        SSS_CONTRIBUTION_TABLE.put("25500", new BigDecimal("1147.50")); // ₱25,250-₱25,749.99
        SSS_CONTRIBUTION_TABLE.put("26000", new BigDecimal("1170.00")); // ₱25,750-₱26,249.99
        SSS_CONTRIBUTION_TABLE.put("26500", new BigDecimal("1192.50")); // ₱26,250-₱26,749.99
        SSS_CONTRIBUTION_TABLE.put("27000", new BigDecimal("1215.00")); // ₱26,750-₱27,249.99
        SSS_CONTRIBUTION_TABLE.put("27500", new BigDecimal("1237.50")); // ₱27,250-₱27,749.99
        SSS_CONTRIBUTION_TABLE.put("28000", new BigDecimal("1260.00")); // ₱27,750-₱28,249.99
        SSS_CONTRIBUTION_TABLE.put("28500", new BigDecimal("1282.50")); // ₱28,250-₱28,749.99
        SSS_CONTRIBUTION_TABLE.put("29000", new BigDecimal("1305.00")); // ₱28,750-₱29,249.99
        SSS_CONTRIBUTION_TABLE.put("29500", new BigDecimal("1327.50")); // ₱29,250-₱29,749.99
        SSS_CONTRIBUTION_TABLE.put("30000", new BigDecimal("1350.00")); // ₱29,750-₱30,000+
    }

    // ==================== PHILHEALTH CONTRIBUTION 2024 ====================
    // Employee Share: 2.5% of monthly compensation
    // Employer Share: 2.5% of monthly compensation
    // Min MSC: ₱10,000 | Max MSC: ₱100,000
    // Reference: PhilHealth Circular 2023-006
    
    public static final BigDecimal PHILHEALTH_EMPLOYEE_RATE = new BigDecimal("0.025");
    public static final BigDecimal PHILHEALTH_EMPLOYER_RATE = new BigDecimal("0.025");
    public static final BigDecimal PHILHEALTH_MINIMUM_MSC = new BigDecimal("10000");
    public static final BigDecimal PHILHEALTH_MAXIMUM_MSC = new BigDecimal("100000");

    // ==================== PAG-IBIG CONTRIBUTION 2024 ====================
    // Employee Share: 1% to 2% (tiered based on salary)
    // Employer Share: 2% (fixed)
    // Monthly Contribution Cap: ₱100
    // Reference: Pag-IBIG/HDMF Circular 2019-006 & subsequent updates
    
    public static final BigDecimal PAGIBIG_LOWER_RATE = new BigDecimal("0.01");    // 1% if salary <= ₱1,500
    public static final BigDecimal PAGIBIG_UPPER_RATE = new BigDecimal("0.02");    // 2% if salary > ₱1,500
    public static final BigDecimal PAGIBIG_EMPLOYER_RATE = new BigDecimal("0.02");
    public static final BigDecimal PAGIBIG_MONTHLY_THRESHOLD = new BigDecimal("1500");
    public static final BigDecimal PAGIBIG_MONTHLY_CAP = new BigDecimal("100");

    // ==================== BIR WITHHOLDING TAX 2024 ====================
    // Taxable Income = Basic Salary - SSS - PhilHealth - Pag-IBIG
    // Tax Table: TRAIN Law (RA 10963) as amended by TRABAHO Act (RA 11534)
    // Reference: BIR RMO 16-2023 & subsequent updates
    
    public static final Map<String, TaxBracket> TAX_BRACKETS = new HashMap<>();
    static {
        // Format: Upper Limit -> Tax Bracket Details
        TAX_BRACKETS.put("20833", new TaxBracket(new BigDecimal("20833"), new BigDecimal("0"), new BigDecimal("0")));
        TAX_BRACKETS.put("33333", new TaxBracket(new BigDecimal("33333"), new BigDecimal("20833"), new BigDecimal("0.20")));
        TAX_BRACKETS.put("66667", new TaxBracket(new BigDecimal("66667"), new BigDecimal("33333"), new BigDecimal("0.25"), new BigDecimal("2500")));
        TAX_BRACKETS.put("166667", new TaxBracket(new BigDecimal("166667"), new BigDecimal("66667"), new BigDecimal("0.30"), new BigDecimal("10833.33")));
        TAX_BRACKETS.put("666667", new TaxBracket(new BigDecimal("666667"), new BigDecimal("166667"), new BigDecimal("0.32"), new BigDecimal("40833.33")));
        TAX_BRACKETS.put("ABOVE", new TaxBracket(BigDecimal.ZERO, new BigDecimal("666667"), new BigDecimal("0.35"), new BigDecimal("200833.33")));
    }

    // ==================== OVERTIME MULTIPLIERS (Labor Code) ====================
    // Reference: Labor Code (as amended by TRABAHOACT & Wage Orders)
    
    public static final BigDecimal OVERTIME_REGULAR_MULTIPLIER = new BigDecimal("1.25");  // 125% of hourly rate
    public static final BigDecimal OVERTIME_SPECIAL_HOLIDAY_MULTIPLIER = new BigDecimal("1.30");  // 130% of hourly rate
    public static final BigDecimal OVERTIME_REGULAR_HOLIDAY_MULTIPLIER = new BigDecimal("1.69");  // 169% of hourly rate

    // ==================== HOLIDAY PAY (Labor Code) ====================
    // Reference: Labor Code Articles 94-95 & DOLE Guidelines
    
    public static final BigDecimal REGULAR_HOLIDAY_PAY = new BigDecimal("1.50");  // 150% of daily rate
    public static final BigDecimal SPECIAL_HOLIDAY_PAY = new BigDecimal("1.30");  // 130% of daily rate
    public static final BigDecimal WORK_ON_REGULAR_HOLIDAY = new BigDecimal("2.00");  // 200% of daily rate (or 300% if rest day)
    public static final BigDecimal WORK_ON_SPECIAL_HOLIDAY = new BigDecimal("1.50");  // 150% of daily rate (or 200% if rest day)

    // ==================== NIGHT DIFFERENTIAL (Labor Code) ====================
    // Reference: Labor Code Article 86 & DOLE Guidelines
    
    public static final BigDecimal NIGHT_DIFFERENTIAL_RATE = new BigDecimal("0.10");  // 10% additional pay
    // Night shift: 10 PM (22:00) to 6 AM (06:00)

    // ==================== REST DAY & HAZARD PAY ====================
    public static final BigDecimal REST_DAY_MULTIPLIER = new BigDecimal("1.30");  // 130% of daily rate
    public static final BigDecimal HAZARD_PAY_RATE = new BigDecimal("0.10");  // 10% additional pay

    // ==================== DAILY & HOURLY RATE CALCULATION ====================
    public static final BigDecimal DAYS_PER_MONTH = new BigDecimal("30");
    public static final BigDecimal HOURS_PER_DAY = new BigDecimal("8");
    public static final BigDecimal HOURS_PER_MONTH = new BigDecimal("240");  // 30 days * 8 hours

    // ==================== 2024-2025 PHILIPPINE HOLIDAYS ====================
    // Regular Holidays, Special Non-Working Days & Special Working Days
    public static final String[] REGULAR_HOLIDAYS_2024 = {
        "2024-01-01",  // New Year's Day
        "2024-02-10",  // EDSA Revolution Anniversary
        "2024-02-12",  // Chinese New Year (Special Non-Working Day)
        "2024-02-13",  // Chinese New Year (Special Non-Working Day)
        "2024-03-28",  // Maundy Thursday
        "2024-03-29",  // Good Friday
        "2024-03-30",  // Black Saturday
        "2024-04-09",  // Day of Valor (Araw ng Kagitingan)
        "2024-04-10",  // Eid'l Fitr (Special Non-Working Day)
        "2024-06-12",  // Independence Day
        "2024-06-17",  // Eid'l Adha (Special Non-Working Day)
        "2024-08-21",  // Ninoy Aquino Day
        "2024-08-26",  // National Heroes Day
        "2024-11-01",  // All Saints' Day
        "2024-11-11",  // Bonifacio Day
        "2024-12-08",  // Feast of the Immaculate Conception
        "2024-12-25",  // Christmas Day
        "2024-12-30",  // Rizal Day
        "2024-12-31"   // Additional Special Day (varies by year)
    };

    public static final String[] REGULAR_HOLIDAYS_2025 = {
        "2025-01-01",  // New Year's Day
        "2025-02-10",  // EDSA Revolution Anniversary
        "2025-02-12",  // Chinese New Year (Special Non-Working Day)
        "2025-02-13",  // Chinese New Year (Special Non-Working Day)
        "2025-04-09",  // Day of Valor
        "2025-04-17",  // Maundy Thursday
        "2025-04-18",  // Good Friday
        "2025-04-19",  // Black Saturday
        "2025-04-30",  // Special Non-Working Day
        "2025-05-12",  // Eid'l Fitr (Special Non-Working Day - tentative)
        "2025-06-12",  // Independence Day
        "2025-06-23",  // Eid'l Adha (Special Non-Working Day - tentative)
        "2025-08-21",  // Ninoy Aquino Day
        "2025-08-25",  // National Heroes Day (4th Monday)
        "2025-11-01",  // All Saints' Day
        "2025-11-11",  // Bonifacio Day
        "2025-12-08",  // Feast of the Immaculate Conception
        "2025-12-25",  // Christmas Day
        "2025-12-30",  // Rizal Day
        "2025-12-31"   // Additional Special Day
    };

    // ==================== TAX BRACKET HELPER CLASS ====================
    public static class TaxBracket {
        public final BigDecimal upperLimit;
        public final BigDecimal lowerLimit;
        public final BigDecimal rate;
        public final BigDecimal baseAmount;

        public TaxBracket(BigDecimal upperLimit, BigDecimal lowerLimit, BigDecimal rate) {
            this(upperLimit, lowerLimit, rate, BigDecimal.ZERO);
        }

        public TaxBracket(BigDecimal upperLimit, BigDecimal lowerLimit, BigDecimal rate, BigDecimal baseAmount) {
            this.upperLimit = upperLimit;
            this.lowerLimit = lowerLimit;
            this.rate = rate;
            this.baseAmount = baseAmount;
        }
    }
}
