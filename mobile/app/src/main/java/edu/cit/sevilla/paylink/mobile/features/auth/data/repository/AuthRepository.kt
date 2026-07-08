package edu.cit.sevilla.paylink.mobile.features.auth.data.repository

import com.google.gson.Gson
import edu.cit.sevilla.paylink.mobile.features.auth.data.model.AuthResponse
import edu.cit.sevilla.paylink.mobile.features.auth.data.model.LoginRequest
import edu.cit.sevilla.paylink.mobile.features.auth.data.model.RegisterRequest
import edu.cit.sevilla.paylink.mobile.features.auth.data.model.Session
import edu.cit.sevilla.paylink.mobile.core.network.ApiError
import edu.cit.sevilla.paylink.mobile.features.auth.data.network.AuthApi
import edu.cit.sevilla.paylink.mobile.features.employees.data.network.EmployeeApi
import edu.cit.sevilla.paylink.mobile.core.session.SessionStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException

class AuthRepository(
    private val authApi: AuthApi,
    private val employeeApi: EmployeeApi,
    private val sessionStore: SessionStore,
) {
    suspend fun login(username: String, password: String): Session = withContext(Dispatchers.IO) {
        val response = safeApiCall { authApi.login(LoginRequest(username.trim(), password)) }
        val session = toSession(response)
        sessionStore.save(session)
        session
    }

    suspend fun register(request: RegisterRequest): Session = withContext(Dispatchers.IO) {
        val response = safeApiCall { authApi.register(request) }
        val session = toSession(response)
        sessionStore.save(session)
        session
    }

    suspend fun logout() = withContext(Dispatchers.IO) {
        sessionStore.clear()
    }

    private suspend fun toSession(auth: AuthResponse): Session {
        val profile = runCatching {
            employeeApi.getMe("Bearer ${auth.token}")
        }.getOrNull()

        return Session(
            token = auth.token,
            userId = auth.userId,
            username = auth.username,
            email = auth.email,
            role = auth.role,
            firstName = profile?.firstName ?: auth.username,
            lastName = profile?.lastName.orEmpty(),
            employeeNumber = profile?.employeeNumber.orEmpty(),
            position = profile?.position.orEmpty(),
            department = profile?.department.orEmpty(),
        )
    }

    private suspend fun <T> safeApiCall(block: suspend () -> T): T {
        return try {
            block()
        } catch (ex: HttpException) {
            val raw = ex.response()?.errorBody()?.string()
            val parsed = runCatching { Gson().fromJson(raw, ApiError::class.java) }.getOrNull()
            val message = parsed?.message ?: parsed?.error ?: "Request failed (${ex.code()})"
            throw IllegalStateException(message)
        } catch (ex: Exception) {
            val message = ex.message ?: "Unable to reach PayLink backend"
            throw IllegalStateException(message)
        }
    }
}
