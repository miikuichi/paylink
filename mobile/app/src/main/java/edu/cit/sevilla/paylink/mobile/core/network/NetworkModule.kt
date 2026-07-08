package edu.cit.sevilla.paylink.mobile.core.network

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
        .build()    val authApi: edu.cit.sevilla.paylink.mobile.features.auth.data.network.AuthApi = retrofit.create(edu.cit.sevilla.paylink.mobile.features.auth.data.network.AuthApi::class.java)
    val employeeApi: edu.cit.sevilla.paylink.mobile.features.employees.data.network.EmployeeApi = retrofit.create(edu.cit.sevilla.paylink.mobile.features.employees.data.network.EmployeeApi::class.java)
    val payrollApi: edu.cit.sevilla.paylink.mobile.features.payroll.data.network.PayrollApi = retrofit.create(edu.cit.sevilla.paylink.mobile.features.payroll.data.network.PayrollApi::class.java)
    val payslipApi: edu.cit.sevilla.paylink.mobile.data.network.PayslipApi = retrofit.create(edu.cit.sevilla.paylink.mobile.data.network.PayslipApi::class.java)
    val payPeriodApi: edu.cit.sevilla.paylink.mobile.features.payperiods.data.network.PayPeriodApi = retrofit.create(edu.cit.sevilla.paylink.mobile.features.payperiods.data.network.PayPeriodApi::class.java)
}
