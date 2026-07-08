package edu.cit.sevilla.paylink.mobile.features.payroll.data.repository

import com.google.gson.Gson
import edu.cit.sevilla.paylink.mobile.core.network.ApiError
import edu.cit.sevilla.paylink.mobile.features.payroll.data.model.PayrollDto
import edu.cit.sevilla.paylink.mobile.features.payroll.data.model.ProcessPayrollRequest
import edu.cit.sevilla.paylink.mobile.features.payroll.data.network.PayrollApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException

class PayrollRepository(
    private val payrollApi: PayrollApi,
) {
    suspend fun getMyPayrolls(bearerToken: String): List<PayrollDto> =
        withContext(Dispatchers.IO) {
            safeApiCall { payrollApi.getMyPayrolls(bearerToken) }
        }

    suspend fun getPayrollsByPeriod(
        bearerToken: String,
        payPeriodId: Long,
    ): List<PayrollDto> = withContext(Dispatchers.IO) {
        safeApiCall { payrollApi.getPayrollsByPeriod(bearerToken, payPeriodId) }
    }

    suspend fun processPayroll(
        bearerToken: String,
        request: ProcessPayrollRequest,
    ): PayrollDto = withContext(Dispatchers.IO) {
        safeApiCall { payrollApi.processPayroll(bearerToken, request) }
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
