package edu.cit.sevilla.paylink.mobile.data.model

data class LoginRequest(
    val username: String,
    val password: String,
)

data class RegisterRequest(
    val username: String,
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String,
    val role: String,
)

data class AuthResponse(
    val token: String,
    val userId: Long,
    val username: String,
    val email: String,
    val role: String,
)

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
)

data class Session(
    val token: String,
    val userId: Long,
    val username: String,
    val email: String,
    val role: String,
    val firstName: String,
    val lastName: String,
    val employeeNumber: String,
    val position: String,
    val department: String,
)
