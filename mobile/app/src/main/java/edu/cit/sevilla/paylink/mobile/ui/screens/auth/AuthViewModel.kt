package edu.cit.sevilla.paylink.mobile.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import edu.cit.sevilla.paylink.mobile.features.auth.data.model.RegisterRequest
import edu.cit.sevilla.paylink.mobile.features.auth.data.model.Session
import edu.cit.sevilla.paylink.mobile.features.auth.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val errorMessage: String = "",
    val successSession: Session? = null,
)

class AuthViewModel(
    private val authRepository: AuthRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = "")
    }

    fun consumeSuccess() {
        _uiState.value = _uiState.value.copy(successSession = null)
    }

    fun login(username: String, password: String) {
        if (username.isBlank() || password.isBlank()) {
            _uiState.value = _uiState.value.copy(errorMessage = "Please enter username and password.")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = "")
            runCatching { authRepository.login(username, password) }
                .onSuccess { session ->
                    _uiState.value = AuthUiState(successSession = session)
                }
                .onFailure { err ->
                    _uiState.value = AuthUiState(errorMessage = err.message ?: "Login failed")
                }
        }
    }

    fun register(
        firstName: String,
        lastName: String,
        email: String,
        username: String,
        password: String,
        confirmPassword: String,
        role: String,
    ) {
        val validationError = validateRegister(
            firstName = firstName,
            lastName = lastName,
            email = email,
            username = username,
            password = password,
            confirmPassword = confirmPassword,
        )

        if (validationError != null) {
            _uiState.value = _uiState.value.copy(errorMessage = validationError)
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = "")
            val request = RegisterRequest(
                username = username.trim(),
                email = email.trim(),
                password = password,
                firstName = firstName.trim(),
                lastName = lastName.trim(),
                role = role,
            )
            runCatching { authRepository.register(request) }
                .onSuccess { session ->
                    _uiState.value = AuthUiState(successSession = session)
                }
                .onFailure { err ->
                    _uiState.value = AuthUiState(errorMessage = err.message ?: "Registration failed")
                }
        }
    }

    fun logout(onDone: () -> Unit) {
        viewModelScope.launch {
            authRepository.logout()
            onDone()
        }
    }

    private fun validateRegister(
        firstName: String,
        lastName: String,
        email: String,
        username: String,
        password: String,
        confirmPassword: String,
    ): String? {
        if (firstName.isBlank()) return "First name is required."
        if (lastName.isBlank()) return "Last name is required."
        if (email.isBlank() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            return "Enter a valid email address."
        }
        if (username.trim().length < 3) return "Username must be at least 3 characters."
        if (password.length < 8) return "Password must be at least 8 characters."
        if (password != confirmPassword) return "Passwords do not match."
        return null
    }

    class Factory(private val repository: AuthRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return AuthViewModel(repository) as T
        }
    }
}
