package edu.cit.sevilla.paylink.mobile.data.model

data class CreateEmployeeRequest(
    val username: String,
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String,
    val position: String?,
    val department: String?,
    val dateHired: String?,
    val basicRate: Double,
)

data class UpdateEmployeeRequest(
    val basicRate: Double? = null,
)

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

data class PayPeriodDto(
    val id: Long,
    val startDate: String,
    val endDate: String,
    val label: String,
    val status: String,
    val createdAt: String?,
)

data class CreatePayPeriodRequest(
    val startDate: String,
    val endDate: String,
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
