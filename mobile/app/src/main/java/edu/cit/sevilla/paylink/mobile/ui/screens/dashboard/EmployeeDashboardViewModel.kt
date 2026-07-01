package edu.cit.sevilla.paylink.mobile.ui.screens.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import edu.cit.sevilla.paylink.mobile.data.model.EmployeeProfile
import edu.cit.sevilla.paylink.mobile.data.model.PayrollDto
import edu.cit.sevilla.paylink.mobile.data.model.PayslipDto
import edu.cit.sevilla.paylink.mobile.data.repo.DashboardRepository
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
    private val repository: DashboardRepository,
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
                val profile = repository.getMyProfile(token)
                val payrolls = repository.getMyPayrolls(token)
                val payslips = repository.getMyPayslips(token)
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

    class Factory(private val repository: DashboardRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return EmployeeDashboardViewModel(repository) as T
        }
    }
}
