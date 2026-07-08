package edu.cit.sevilla.paylink.mobile.features.payslips.data.repository

import com.google.gson.Gson
import edu.cit.sevilla.paylink.mobile.core.network.ApiError
import edu.cit.sevilla.paylink.mobile.features.payslips.data.model.PayslipDto
import edu.cit.sevilla.paylink.mobile.features.payslips.data.network.PayslipApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException

class PayslipRepository(
    private val payslipApi: PayslipApi,
) {
    suspend fun getMyPayslips(bearerToken: String): List<PayslipDto> =
        withContext(Dispatchers.IO) {
            safeApiCall { payslipApi.getMyPayslips(bearerToken) }
        }

    suspend fun getPayslipsByPeriod(
        bearerToken: String,
        payPeriodId: Long,
    ): List<PayslipDto> = withContext(Dispatchers.IO) {
        safeApiCall { payslipApi.getPayslipsByPeriod(bearerToken, payPeriodId) }
    }

    suspend fun generatePayslip(
        bearerToken: String,
        payrollId: Long,
    ): PayslipDto = withContext(Dispatchers.IO) {
        safeApiCall { payslipApi.generatePayslip(bearerToken, payrollId) }
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
