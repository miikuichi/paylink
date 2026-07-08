package edu.cit.sevilla.paylink.mobile.features.payperiods.data.model

data class PayPeriodDto(
    val id: Long,
    val startDate: String,
    val endDate: String,
    val label: String,
    val status: String,
    val createdAt: String?,
)

data class CreatePayPeriodRequest(
    val startDate: String,
    val endDate: String,
)
