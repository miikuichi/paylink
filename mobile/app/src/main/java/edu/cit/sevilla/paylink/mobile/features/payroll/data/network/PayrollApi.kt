package edu.cit.sevilla.paylink.mobile.features.payroll.data.network

import edu.cit.sevilla.paylink.mobile.features.payroll.data.model.PayrollDto
import edu.cit.sevilla.paylink.mobile.features.payroll.data.model.ProcessPayrollRequest
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Query

interface PayrollApi {
    @GET("payrolls/me")
    suspend fun getMyPayrolls(
        @Header("Authorization") bearerToken: String,
    ): List<PayrollDto>

    @GET("payrolls")
    suspend fun getPayrollsByPeriod(
        @Header("Authorization") bearerToken: String,
        @Query("payPeriodId") payPeriodId: Long,
    ): List<PayrollDto>

    @POST("payrolls/process")
    suspend fun processPayroll(
        @Header("Authorization") bearerToken: String,
        @Body body: ProcessPayrollRequest,
    ): PayrollDto
}
