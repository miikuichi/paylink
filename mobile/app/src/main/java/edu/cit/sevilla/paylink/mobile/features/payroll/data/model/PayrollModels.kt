package edu.cit.sevilla.paylink.mobile.features.payroll.data.model

data class PayrollItemDto(
    val id: Long,
    val itemType: String,
    val label: String,
    val amount: Double,
)

data class PayrollDto(
    val id: Long,
    val employeeId: Long,
    val employeeNumber: String,
    val employeeName: String,
    val payPeriodId: Long,
    val payPeriodLabel: String,
    val basicPay: Double,
    val grossPay: Double,
    val totalAllowances: Double,
    val totalDeductions: Double,
    val netPay: Double,
    val status: String,
    val processedAt: String?,
    val items: List<PayrollItemDto>,
    val hasPayslip: Boolean,
)

data class ProcessPayrollRequest(
    val employeeId: Long,
    val payPeriodId: Long,
    val additionalItems: List<AdditionalPayrollItem> = emptyList(),
)

data class AdditionalPayrollItem(
    val itemType: String,
    val label: String,
    val amount: Double,
)
