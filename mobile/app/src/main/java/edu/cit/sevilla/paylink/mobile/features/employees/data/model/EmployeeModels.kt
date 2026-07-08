package edu.cit.sevilla.paylink.mobile.features.employees.data.model

data class EmployeeProfile(
    val id: Long,
    val userId: Long,
    val username: String,
    val email: String,
    val employeeNumber: String,
    val firstName: String,
    val lastName: String,
    val position: String?,
    val department: String?,
    val dateHired: String?,
    val basicRate: Double?,
    val status: String,
    val createdAt: String?,
)

data class CreateEmployeeRequest(
    val username: String,
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String,
    val position: String?,
    val department: String?,
    val dateHired: String?,
    val basicRate: Double,
)

data class UpdateEmployeeRequest(
    val basicRate: Double? = null,
)
