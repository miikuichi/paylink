package edu.cit.sevilla.paylink.mobile.features.hr_dashboard.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import edu.cit.sevilla.paylink.mobile.features.employees.data.model.CreateEmployeeRequest
import edu.cit.sevilla.paylink.mobile.features.employees.data.model.EmployeeProfile
import edu.cit.sevilla.paylink.mobile.features.employees.data.model.UpdateEmployeeRequest
import edu.cit.sevilla.paylink.mobile.features.employees.data.repository.EmployeeRepository
import edu.cit.sevilla.paylink.mobile.features.payperiods.data.model.CreatePayPeriodRequest
import edu.cit.sevilla.paylink.mobile.features.payperiods.data.model.PayPeriodDto
import edu.cit.sevilla.paylink.mobile.features.payperiods.data.repository.PayPeriodRepository
import edu.cit.sevilla.paylink.mobile.features.payroll.data.model.PayrollDto
import edu.cit.sevilla.paylink.mobile.features.payroll.data.model.ProcessPayrollRequest
import edu.cit.sevilla.paylink.mobile.features.payroll.data.repository.PayrollRepository
import edu.cit.sevilla.paylink.mobile.features.payslips.data.model.PayslipDto
import edu.cit.sevilla.paylink.mobile.features.payslips.data.repository.PayslipRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class HrDashboardState(
    val isLoading: Boolean = true,
    val errorMessage: String = "",
    val employees: List<EmployeeProfile> = emptyList(),
    val payPeriods: List<PayPeriodDto> = emptyList(),
    val payrolls: List<PayrollDto> = emptyList(),
    val payslips: List<PayslipDto> = emptyList(),
    val selectedPeriodId: Long? = null,
    val busyIds: Set<Long> = emptySet(),
)

class HrDashboardViewModel(
    private val employeeRepository: EmployeeRepository,
    private val payPeriodRepository: PayPeriodRepository,
    private val payrollRepository: PayrollRepository,
    private val payslipRepository: PayslipRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(HrDashboardState())
    val state: StateFlow<HrDashboardState> = _state.asStateFlow()

    private var loadedToken: String? = null

    fun load(token: String, force: Boolean = false) {
        if (!force && token == loadedToken && !_state.value.isLoading && _state.value.errorMessage.isBlank()) {
            return
        }

        loadedToken = token
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, errorMessage = "")

            val employeesResult = runCatching { employeeRepository.getEmployees(bearer(token)) }
            val periodsResult = runCatching { payPeriodRepository.getPayPeriods(bearer(token)) }

            val employees = employeesResult.getOrElse { emptyList() }
            val periods = periodsResult.getOrElse { emptyList() }
            val selected = _state.value.selectedPeriodId ?: periods.firstOrNull()?.id

            _state.value = _state.value.copy(
                isLoading = false,
                employees = employees,
                payPeriods = periods,
                selectedPeriodId = selected,
                payrolls = emptyList(),
                payslips = emptyList(),
                errorMessage = employeesResult.exceptionOrNull()?.message
                    ?: periodsResult.exceptionOrNull()?.message
                    ?: "",
            )

            selected?.let { periodId ->
                refreshPeriodData(token, periodId)
            }
        }
    }

    fun clearError() {
        _state.value = _state.value.copy(errorMessage = "")
    }

    fun selectPeriod(token: String, payPeriodId: Long) {
        _state.value = _state.value.copy(selectedPeriodId = payPeriodId)
        refreshPeriodData(token, payPeriodId)
    }

    fun createEmployee(token: String, request: CreateEmployeeRequest) {
        viewModelScope.launch {
            runCatching { employeeRepository.createEmployee(bearer(token), request) }
                .onSuccess { load(token, force = true) }
                .onFailure { err ->
                    _state.value = _state.value.copy(errorMessage = err.message ?: "Failed to create employee")
                }
        }
    }

    fun updateEmployeeRate(token: String, employeeId: Long, basicRate: Double) {
        viewModelScope.launch {
            runCatching {
                employeeRepository.updateEmployee(
                    bearer(token),
                    employeeId,
                    UpdateEmployeeRequest(basicRate = basicRate),
                )
            }.onSuccess { load(token, force = true) }
                .onFailure { err ->
                    _state.value = _state.value.copy(errorMessage = err.message ?: "Failed to update employee")
                }
        }
    }

    fun createPayPeriod(token: String, startDate: String, endDate: String) {
        viewModelScope.launch {
            runCatching {
                payPeriodRepository.createPayPeriod(
                    bearer(token),
                    CreatePayPeriodRequest(startDate, endDate),
                )
            }
                .onSuccess { created ->
                    load(token, force = true)
                    _state.value = _state.value.copy(selectedPeriodId = created.id)
                }
                .onFailure { err ->
                    _state.value = _state.value.copy(errorMessage = err.message ?: "Failed to create pay period")
                }
        }
    }

    fun processPayroll(token: String, employeeId: Long) {
        val periodId = _state.value.selectedPeriodId ?: return
        _state.value = _state.value.copy(busyIds = _state.value.busyIds + employeeId)

        viewModelScope.launch {
            runCatching {
                payrollRepository.processPayroll(
                    bearer(token),
                    ProcessPayrollRequest(employeeId = employeeId, payPeriodId = periodId),
                )
            }.onSuccess {
                refreshPeriodData(token, periodId)
            }.onFailure { err ->
                _state.value = _state.value.copy(errorMessage = err.message ?: "Payroll processing failed")
            }

            _state.value = _state.value.copy(busyIds = _state.value.busyIds - employeeId)
        }
    }

    fun generatePayslip(token: String, payrollId: Long) {
        _state.value = _state.value.copy(busyIds = _state.value.busyIds + payrollId)

        viewModelScope.launch {
            runCatching { payslipRepository.generatePayslip(bearer(token), payrollId) }
                .onSuccess {
                    _state.value.selectedPeriodId?.let { refreshPeriodData(token, it) }
                }
                .onFailure { err ->
                    _state.value = _state.value.copy(errorMessage = err.message ?: "Payslip generation failed")
                }

            _state.value = _state.value.copy(busyIds = _state.value.busyIds - payrollId)
        }
    }

    private fun refreshPeriodData(token: String, payPeriodId: Long) {
        viewModelScope.launch {
            runCatching {
                val payrolls = payrollRepository.getPayrollsByPeriod(bearer(token), payPeriodId)
                val payslips = payslipRepository.getPayslipsByPeriod(bearer(token), payPeriodId)
                payrolls to payslips
            }.onSuccess { (payrolls, payslips) ->
                _state.value = _state.value.copy(
                    payrolls = payrolls,
                    payslips = payslips,
                    errorMessage = "",
                )
            }.onFailure { err ->
                _state.value = _state.value.copy(errorMessage = err.message ?: "Failed to refresh data")
            }
        }
    }

    private fun bearer(token: String) = "Bearer $token"

    class Factory(
        private val employeeRepository: EmployeeRepository,
        private val payPeriodRepository: PayPeriodRepository,
        private val payrollRepository: PayrollRepository,
        private val payslipRepository: PayslipRepository,
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return HrDashboardViewModel(
                employeeRepository,
                payPeriodRepository,
                payrollRepository,
                payslipRepository,
            ) as T
        }
    }
}
