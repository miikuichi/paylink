package edu.cit.sevilla.paylink.mobile.features.payperiods.data.network

import edu.cit.sevilla.paylink.mobile.features.payperiods.data.model.CreatePayPeriodRequest
import edu.cit.sevilla.paylink.mobile.features.payperiods.data.model.PayPeriodDto
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface PayPeriodApi {
    @GET("pay-periods")
    suspend fun getPayPeriods(
        @Header("Authorization") bearerToken: String,
    ): List<PayPeriodDto>

    @POST("pay-periods")
    suspend fun createPayPeriod(
        @Header("Authorization") bearerToken: String,
        @Body body: CreatePayPeriodRequest,
    ): PayPeriodDto
}
