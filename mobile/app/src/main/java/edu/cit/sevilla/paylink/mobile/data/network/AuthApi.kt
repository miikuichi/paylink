package edu.cit.sevilla.paylink.mobile.data.network

import edu.cit.sevilla.paylink.mobile.data.model.AuthResponse
import edu.cit.sevilla.paylink.mobile.data.model.LoginRequest
import edu.cit.sevilla.paylink.mobile.data.model.RegisterRequest
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApi {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): AuthResponse
}
