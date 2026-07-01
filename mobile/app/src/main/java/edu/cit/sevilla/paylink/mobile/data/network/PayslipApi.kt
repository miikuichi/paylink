package edu.cit.sevilla.paylink.mobile.data.network

import edu.cit.sevilla.paylink.mobile.data.model.PayslipDto
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface PayslipApi {
    @GET("payslips/me")
    suspend fun getMyPayslips(
        @Header("Authorization") bearerToken: String,
    ): List<PayslipDto>

    @GET("payslips")
    suspend fun getPayslipsByPeriod(
        @Header("Authorization") bearerToken: String,
        @Query("payPeriodId") payPeriodId: Long,
    ): List<PayslipDto>

    @POST("payslips/generate/{payrollId}")
    suspend fun generatePayslip(
        @Header("Authorization") bearerToken: String,
        @Path("payrollId") payrollId: Long,
    ): PayslipDto
}
