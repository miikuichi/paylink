package edu.cit.sevilla.paylink.mobile.features.payperiods.data.repository

import com.google.gson.Gson
import edu.cit.sevilla.paylink.mobile.core.network.ApiError
import edu.cit.sevilla.paylink.mobile.features.payperiods.data.model.CreatePayPeriodRequest
import edu.cit.sevilla.paylink.mobile.features.payperiods.data.model.PayPeriodDto
import edu.cit.sevilla.paylink.mobile.features.payperiods.data.network.PayPeriodApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException

class PayPeriodRepository(
    private val payPeriodApi: PayPeriodApi,
) {
    suspend fun getPayPeriods(bearerToken: String): List<PayPeriodDto> =
        withContext(Dispatchers.IO) {
            safeApiCall { payPeriodApi.getPayPeriods(bearerToken) }
        }

    suspend fun createPayPeriod(
        bearerToken: String,
        request: CreatePayPeriodRequest,
    ): PayPeriodDto = withContext(Dispatchers.IO) {
        safeApiCall { payPeriodApi.createPayPeriod(bearerToken, request) }
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
