package edu.cit.sevilla.paylink.mobile.data.network

import edu.cit.sevilla.paylink.mobile.BuildConfig
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object NetworkModule {
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val httpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .writeTimeout(20, TimeUnit.SECONDS)
        .build()

    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.API_BASE_URL)
        .client(httpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val authApi: AuthApi = retrofit.create(AuthApi::class.java)
    val employeeApi: EmployeeApi = retrofit.create(EmployeeApi::class.java)
    val payrollApi: PayrollApi = retrofit.create(PayrollApi::class.java)
    val payslipApi: PayslipApi = retrofit.create(PayslipApi::class.java)
    val payPeriodApi: PayPeriodApi = retrofit.create(PayPeriodApi::class.java)
}
