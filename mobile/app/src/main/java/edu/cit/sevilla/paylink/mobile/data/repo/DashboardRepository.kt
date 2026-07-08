package edu.cit.sevilla.paylink.mobile.data.repo

import com.google.gson.Gson
import edu.cit.sevilla.paylink.mobile.features.employees.data.model.CreateEmployeeRequest
import edu.cit.sevilla.paylink.mobile.features.payperiods.data.model.CreatePayPeriodRequest
import edu.cit.sevilla.paylink.mobile.features.employees.data.model.EmployeeProfile
import edu.cit.sevilla.paylink.mobile.features.payperiods.data.model.PayPeriodDto
import edu.cit.sevilla.paylink.mobile.features.payroll.data.model.PayrollDto
import edu.cit.sevilla.paylink.mobile.data.model.PayslipDto
import edu.cit.sevilla.paylink.mobile.features.payroll.data.model.ProcessPayrollRequest
import edu.cit.sevilla.paylink.mobile.features.employees.data.model.UpdateEmployeeRequest
import edu.cit.sevilla.paylink.mobile.core.network.ApiError
import edu.cit.sevilla.paylink.mobile.features.employees.data.network.EmployeeApi
import edu.cit.sevilla.paylink.mobile.features.payperiods.data.network.PayPeriodApi
import edu.cit.sevilla.paylink.mobile.features.payroll.data.network.PayrollApi
import edu.cit.sevilla.paylink.mobile.data.network.PayslipApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import java.io.IOException

class DashboardRepository(
    private val employeeApi: EmployeeApi,
    private val payrollApi: PayrollApi,
    private val payslipApi: PayslipApi,
    private val payPeriodApi: PayPeriodApi,
) {
    suspend fun getMyProfile(token: String): EmployeeProfile = withContext(Dispatchers.IO) {
        safeApiCall { employeeApi.getMe(bearer(token)) }
    }

    suspend fun getMyPayrolls(token: String): List<PayrollDto> = withContext(Dispatchers.IO) {
        safeApiCall { payrollApi.getMyPayrolls(bearer(token)) }
    }

    suspend fun getMyPayslips(token: String): List<PayslipDto> = withContext(Dispatchers.IO) {
        safeApiCall { payslipApi.getMyPayslips(bearer(token)) }
    }

    suspend fun getEmployees(token: String): List<EmployeeProfile> = withContext(Dispatchers.IO) {
        safeApiCall { employeeApi.getEmployees(bearer(token)) }
    }

    suspend fun createEmployee(token: String, request: CreateEmployeeRequest): EmployeeProfile =
        withContext(Dispatchers.IO) {
            safeApiCall { employeeApi.createEmployee(bearer(token), request) }
        }

    suspend fun updateEmployee(token: String, employeeId: Long, request: UpdateEmployeeRequest): EmployeeProfile =
        withContext(Dispatchers.IO) {
            safeApiCall { employeeApi.updateEmployee(bearer(token), employeeId, request) }
        }

    suspend fun getPayPeriods(token: String): List<PayPeriodDto> = withContext(Dispatchers.IO) {
        safeApiCall { payPeriodApi.getPayPeriods(bearer(token)) }
    }

    suspend fun createPayPeriod(token: String, request: CreatePayPeriodRequest): PayPeriodDto =
        withContext(Dispatchers.IO) {
            safeApiCall { payPeriodApi.createPayPeriod(bearer(token), request) }
        }

    suspend fun getPayrollsByPeriod(token: String, payPeriodId: Long): List<PayrollDto> =
        withContext(Dispatchers.IO) {
            safeApiCall { payrollApi.getPayrollsByPeriod(bearer(token), payPeriodId) }
        }

    suspend fun processPayroll(token: String, request: ProcessPayrollRequest): PayrollDto =
        withContext(Dispatchers.IO) {
            safeApiCall { payrollApi.processPayroll(bearer(token), request) }
        }

    suspend fun getPayslipsByPeriod(token: String, payPeriodId: Long): List<PayslipDto> =
        withContext(Dispatchers.IO) {
            safeApiCall { payslipApi.getPayslipsByPeriod(bearer(token), payPeriodId) }
        }

    suspend fun generatePayslip(token: String, payrollId: Long): PayslipDto = withContext(Dispatchers.IO) {
        safeApiCall { payslipApi.generatePayslip(bearer(token), payrollId) }
    }

    private fun bearer(token: String): String = "Bearer $token"

    private suspend fun <T> safeApiCall(block: suspend () -> T): T {
        return try {
            block()
        } catch (ex: HttpException) {
            val code = ex.code()
            val requestPath = ex.response()?.raw()?.request?.url?.encodedPath
            val raw = ex.response()?.errorBody()?.string()
            val parsed = runCatching { Gson().fromJson(raw, ApiError::class.java) }.getOrNull()
            val backendMessage = parsed?.message ?: parsed?.error
            val backendPath = parsed?.path ?: requestPath
            val summary = "HTTP $code${if (!backendPath.isNullOrBlank()) " on $backendPath" else ""}"
            val message = when {
                !backendMessage.isNullOrBlank() -> "$summary: $backendMessage"
                else -> "$summary: Request failed"
            }
            throw IllegalStateException(message)
        } catch (ex: IOException) {
            throw IllegalStateException("Network error: unable to reach PayLink backend")
        } catch (ex: Exception) {
            val message = ex.message ?: "Unable to reach PayLink backend"
            throw IllegalStateException(message)
        }
    }
}
