package edu.cit.sevilla.paylink.mobile.core.network

data class ApiError(
    val status: Int? = null,
    val error: String? = null,
    val message: String? = null,
    val details: Map<String, String>? = null,
    val path: String? = null,
    val timestamp: String? = null,
)
