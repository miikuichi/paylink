package edu.cit.sevilla.paylink.mobile.features.employee_dashboard.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import edu.cit.sevilla.paylink.mobile.features.employees.data.model.EmployeeProfile
import edu.cit.sevilla.paylink.mobile.features.payroll.data.model.PayrollDto
import edu.cit.sevilla.paylink.mobile.features.payslips.data.model.PayslipDto
import edu.cit.sevilla.paylink.mobile.features.employees.data.repository.EmployeeRepository
import edu.cit.sevilla.paylink.mobile.features.payroll.data.repository.PayrollRepository
import edu.cit.sevilla.paylink.mobile.features.payslips.data.repository.PayslipRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class EmployeeDashboardState(
    val isLoading: Boolean = true,
    val errorMessage: String = "",
    val profile: EmployeeProfile? = null,
    val payrolls: List<PayrollDto> = emptyList(),
    val payslips: List<PayslipDto> = emptyList(),
)

class EmployeeDashboardViewModel(
    private val employeeRepository: EmployeeRepository,
    private val payrollRepository: PayrollRepository,
    private val payslipRepository: PayslipRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(EmployeeDashboardState())
    val state: StateFlow<EmployeeDashboardState> = _state.asStateFlow()

    private var loadedToken: String? = null

    fun load(token: String, force: Boolean = false) {
        if (!force && token == loadedToken && !_state.value.isLoading && _state.value.errorMessage.isBlank()) {
            return
        }

        loadedToken = token
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, errorMessage = "")
            runCatching {
                val bearerToken = "Bearer $token"
                val profile = employeeRepository.getMe(bearerToken)
                val payrolls = payrollRepository.getMyPayrolls(bearerToken)
                val payslips = payslipRepository.getMyPayslips(bearerToken)
                EmployeeDashboardState(
                    isLoading = false,
                    profile = profile,
                    payrolls = payrolls,
                    payslips = payslips,
                )
            }.onSuccess { newState ->
                _state.value = newState
            }.onFailure { err ->
                _state.value = _state.value.copy(
                    isLoading = false,
                    errorMessage = err.message ?: "Unable to load dashboard data",
                )
            }
        }
    }

    fun clearError() {
        _state.value = _state.value.copy(errorMessage = "")
    }

    class Factory(
        private val employeeRepository: EmployeeRepository,
        private val payrollRepository: PayrollRepository,
        private val payslipRepository: PayslipRepository,
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return EmployeeDashboardViewModel(
                employeeRepository,
                payrollRepository,
                payslipRepository,
            ) as T
        }
    }
}
