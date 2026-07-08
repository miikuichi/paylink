package edu.cit.sevilla.paylink.mobile.features.employees.data.network

import edu.cit.sevilla.paylink.mobile.features.employees.data.model.EmployeeProfile
import edu.cit.sevilla.paylink.mobile.features.employees.data.model.CreateEmployeeRequest
import edu.cit.sevilla.paylink.mobile.features.employees.data.model.UpdateEmployeeRequest
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

interface EmployeeApi {
    @GET("employees")
    suspend fun getEmployees(
        @Header("Authorization") bearerToken: String,
    ): List<EmployeeProfile>

    @GET("employees/me")
    suspend fun getMe(
        @Header("Authorization") bearerToken: String,
    ): EmployeeProfile

    @POST("employees")
    suspend fun createEmployee(
        @Header("Authorization") bearerToken: String,
        @Body body: CreateEmployeeRequest,
    ): EmployeeProfile

    @PUT("employees/{id}")
    suspend fun updateEmployee(
        @Header("Authorization") bearerToken: String,
        @Path("id") id: Long,
        @Body body: UpdateEmployeeRequest,
    ): EmployeeProfile
}
