package edu.cit.sevilla.paylink.mobile.features.employees.data.repository

import com.google.gson.Gson
import edu.cit.sevilla.paylink.mobile.core.network.ApiError
import edu.cit.sevilla.paylink.mobile.features.employees.data.model.EmployeeProfile
import edu.cit.sevilla.paylink.mobile.features.employees.data.model.CreateEmployeeRequest
import edu.cit.sevilla.paylink.mobile.features.employees.data.model.UpdateEmployeeRequest
import edu.cit.sevilla.paylink.mobile.features.employees.data.network.EmployeeApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException

class EmployeeRepository(
    private val employeeApi: EmployeeApi,
) {
    suspend fun getEmployees(bearerToken: String): List<EmployeeProfile> =
        withContext(Dispatchers.IO) {
            safeApiCall { employeeApi.getEmployees(bearerToken) }
        }

    suspend fun getMe(bearerToken: String): EmployeeProfile =
        withContext(Dispatchers.IO) {
            safeApiCall { employeeApi.getMe(bearerToken) }
        }

    suspend fun createEmployee(
        bearerToken: String,
        request: CreateEmployeeRequest,
    ): EmployeeProfile = withContext(Dispatchers.IO) {
        safeApiCall { employeeApi.createEmployee(bearerToken, request) }
    }

    suspend fun updateEmployee(
        bearerToken: String,
        id: Long,
        request: UpdateEmployeeRequest,
    ): EmployeeProfile = withContext(Dispatchers.IO) {
        safeApiCall { employeeApi.updateEmployee(bearerToken, id, request) }
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
