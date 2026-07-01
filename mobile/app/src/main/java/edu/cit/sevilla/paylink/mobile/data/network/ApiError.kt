package edu.cit.sevilla.paylink.mobile.data.network

data class ApiError(
    val status: Int? = null,
    val error: String? = null,
    val message: String? = null,
    val path: String? = null,
    val timestamp: String? = null,
)
