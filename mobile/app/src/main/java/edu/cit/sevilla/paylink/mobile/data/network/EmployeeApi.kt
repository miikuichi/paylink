package edu.cit.sevilla.paylink.mobile.data.network

import edu.cit.sevilla.paylink.mobile.data.model.EmployeeProfile
import retrofit2.http.GET
import retrofit2.http.Header

interface EmployeeApi {
    @GET("employees/me")
    suspend fun getMe(
        @Header("Authorization") bearerToken: String,
    ): EmployeeProfile
}
