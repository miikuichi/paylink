package edu.cit.sevilla.paylink.mobile.data.model

data class PayslipDto(
    val id: Long,
    val payrollId: Long,
    val employeeId: Long,
    val employeeNumber: String,
    val employeeName: String,
    val position: String?,
    val department: String?,
    val periodStart: String,
    val periodEnd: String,
    val periodLabel: String,
    val basicPay: Double,
    val grossPay: Double,
    val totalAllowances: Double,
    val totalDeductions: Double,
    val netPay: Double,
    val allowances: List<PayrollItemDto>,
    val deductions: List<PayrollItemDto>,
    val issuedAt: String?,
    val remarks: String?,
)

data class PayrollItemDto(
    val id: Long,
    val itemType: String,
    val label: String,
    val amount: Double,
)
