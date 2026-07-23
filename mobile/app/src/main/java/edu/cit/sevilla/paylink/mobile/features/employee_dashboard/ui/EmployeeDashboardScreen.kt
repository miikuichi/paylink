package edu.cit.sevilla.paylink.mobile.features.employee_dashboard.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Badge
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.animateColorAsState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import edu.cit.sevilla.paylink.mobile.features.payroll.data.model.PayrollDto
import edu.cit.sevilla.paylink.mobile.features.payslips.data.model.PayslipDto
import edu.cit.sevilla.paylink.mobile.features.auth.data.model.Session
import edu.cit.sevilla.paylink.mobile.core.ui.theme.Cream100
import edu.cit.sevilla.paylink.mobile.core.ui.theme.Cream200
import edu.cit.sevilla.paylink.mobile.core.ui.theme.Gold100
import edu.cit.sevilla.paylink.mobile.core.ui.theme.Gold500
import edu.cit.sevilla.paylink.mobile.core.ui.theme.Maroon700
import edu.cit.sevilla.paylink.mobile.core.ui.theme.Maroon800

private val employeeTabs = listOf("Overview", "My Payslips", "Payslip History")

@Composable
fun EmployeeDashboardScreen(
    session: Session,
    viewModel: EmployeeDashboardViewModel,
    onLogout: () -> Unit,
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var selectedTab by remember { mutableIntStateOf(0) }
    val name = session.firstName.ifBlank { session.username }

    LaunchedEffect(session.token) {
        viewModel.load(session.token)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Cream100, Color(0xFFF9ECE6), Cream200)))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Card(
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = Maroon700),
            elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Welcome back, $name",
                        style = MaterialTheme.typography.headlineSmall,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        text = state.profile?.position ?: "Employee dashboard",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White.copy(alpha = 0.9f),
                    )
                }
                Button(
                    onClick = onLogout,
                    colors = ButtonDefaults.buttonColors(containerColor = Gold500, contentColor = Maroon800),
                    modifier = Modifier.heightIn(min = 40.dp),
                ) {
                    Text("Log out")
                }
            }
        }

        if (state.isLoading) {
            LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
        }
        if (state.errorMessage.isNotBlank()) {
            DashboardErrorBanner(
                message = state.errorMessage,
                onRetry = { viewModel.load(session.token, force = true) },
                onDismiss = viewModel::clearError,
            )
        }

        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = Gold100,
            contentColor = Maroon800,
        ) {
            employeeTabs.forEachIndexed { index, tab ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(tab) },
                )
            }
        }

        Crossfade(
            targetState = selectedTab,
            animationSpec = tween(durationMillis = 220),
            label = "employee-tab-crossfade",
        ) { tabIndex ->
            when (tabIndex) {
                0 -> EmployeeOverviewTab(
                    session = session,
                    payrolls = state.payrolls,
                    payslips = state.payslips,
                    onRefresh = { viewModel.load(session.token, force = true) },
                )

                1 -> EmployeePayslipsTab(state.payslips)
                else -> EmployeePayslipHistoryTab(state.payslips)
            }
        }
    }
}

@Composable
private fun EmployeeOverviewTab(
    session: Session,
    payrolls: List<PayrollDto>,
    payslips: List<PayslipDto>,
    onRefresh: () -> Unit,
) {
    val latestNetPay = payrolls.firstOrNull()?.netPay ?: 0.0
    val latestPayslip = payslips.firstOrNull()
    val ytdNetPay = payrolls.take(4).sumOf { it.netPay }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                EmployeeStatCard("Latest Net Pay", formatCurrency(latestNetPay), Modifier.weight(1f))
                EmployeeStatCard("Payslips", payslips.size.toString(), Modifier.weight(1f))
            }
        }
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                EmployeeStatCard("Last 4 Net", formatCurrency(ytdNetPay), Modifier.weight(1f))
                EmployeeStatCard("Employee ID", session.employeeNumber.ifBlank { "Pending" }, Modifier.weight(1f))
            }
        }
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                        Text("Latest Payslip", fontWeight = FontWeight.Bold)
                        if (latestPayslip != null) {
                            Badge { Text("Live") }
                        }
                    }
                    HorizontalDivider()
                    if (latestPayslip == null) {
                        Text("No payslip yet. HR/Admin must process payroll first.")
                    } else {
                        Text(latestPayslip.periodLabel)
                        Text("Gross: ${formatCurrency(latestPayslip.grossPay)}")
                        Text("Deductions: ${formatCurrency(latestPayslip.totalDeductions)}")
                        Text("Net: ${formatCurrency(latestPayslip.netPay)}", fontWeight = FontWeight.SemiBold)
                    }
                    Button(onClick = onRefresh, modifier = Modifier.fillMaxWidth()) {
                        Text("Refresh Data")
                    }
                }
            }
        }
    }
}

@Composable
private fun EmployeePayslipsTab(payslips: List<PayslipDto>) {
    var selectedPayslip by remember { androidx.compose.runtime.mutableStateOf<PayslipDto?>(null) }

    LazyColumn(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Text("Date", modifier = Modifier.weight(1.3f), fontWeight = FontWeight.Bold)
                    Text("Net Pay", modifier = Modifier.weight(1f), fontWeight = FontWeight.Bold)
                    Text("Details", modifier = Modifier.weight(1f), fontWeight = FontWeight.Bold)
                }
            }
        }

        if (payslips.isEmpty()) {
            item {
                Text(
                    "No payslips issued yet.",
                    modifier = Modifier.padding(12.dp),
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                )
            }
        }
        items(payslips, key = { it.id }) { payslip ->
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    val displayDate = payslip.issuedAt?.take(10) ?: payslip.periodLabel
                    Text(displayDate, modifier = Modifier.weight(1.3f), fontWeight = FontWeight.SemiBold)
                    Text(formatCurrency(payslip.netPay), modifier = Modifier.weight(1f), fontWeight = FontWeight.SemiBold)
                    Button(
                        onClick = { selectedPayslip = payslip },
                        modifier = Modifier
                            .weight(1f)
                            .heightIn(min = 40.dp),
                    ) {
                        Text("Details")
                    }
                }
            }
        }
    }

    selectedPayslip?.let { payslip ->
        PayslipDetailsDialog(
            payslip = payslip,
            onClose = { selectedPayslip = null },
        )
    }
}

@Composable
private fun EmployeePayslipHistoryTab(payslips: List<PayslipDto>) {
    LazyColumn(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        if (payslips.isEmpty()) {
            item {
                Text(
                    "No payslip history yet.",
                    modifier = Modifier.padding(12.dp),
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                )
            }
        }

        items(payslips, key = { it.id }) { payslip ->
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(payslip.periodLabel, fontWeight = FontWeight.Bold)
                    Text("Gross: ${formatCurrency(payslip.grossPay)}")
                    Text("Deductions: ${formatCurrency(payslip.totalDeductions)}")
                    Text("Net: ${formatCurrency(payslip.netPay)}")
                    Text("Issued: ${payslip.issuedAt ?: "Pending"}")
                }
            }
        }
    }
}

@Composable
private fun PayslipDetailsDialog(
    payslip: PayslipDto,
    onClose: () -> Unit,
) {
    val governmentLabels = setOf(
        "SSS Contribution",
        "PhilHealth Contribution",
        "Pag-IBIG Contribution",
        "Withholding Tax",
    )
    val governmentDeductions = payslip.deductions.filter { it.label in governmentLabels }
    val otherDeductions = payslip.deductions.filter { it.label !in governmentLabels }

    AlertDialog(
        onDismissRequest = onClose,
        title = { Text("Payslip Details") },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 460.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Text("Period: ${payslip.periodLabel}", fontWeight = FontWeight.Bold)
                Text("Employee: ${payslip.employeeName}")
                Text("Gross Pay: ${formatCurrency(payslip.grossPay)}")
                Text("Total Deductions: ${formatCurrency(payslip.totalDeductions)}")
                Text("Net Pay: ${formatCurrency(payslip.netPay)}", fontWeight = FontWeight.SemiBold)

                HorizontalDivider()
                Text("Government Contributions", fontWeight = FontWeight.Bold)
                if (governmentDeductions.isEmpty()) {
                    Text(
                        "No government deductions listed.",
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                    )
                } else {
                    governmentDeductions.forEach { item ->
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(item.label)
                            Text(formatCurrency(item.amount), fontWeight = FontWeight.SemiBold)
                        }
                    }
                }

                if (otherDeductions.isNotEmpty()) {
                    HorizontalDivider()
                    Text("Other Deductions", fontWeight = FontWeight.Bold)
                    otherDeductions.forEach { item ->
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(item.label)
                            Text(formatCurrency(item.amount), fontWeight = FontWeight.SemiBold)
                        }
                    }
                }

                if (payslip.allowances.isNotEmpty()) {
                    HorizontalDivider()
                    Text("Allowances", fontWeight = FontWeight.Bold)
                    payslip.allowances.forEach { item ->
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(item.label)
                            Text(formatCurrency(item.amount), fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = onClose) {
                Text("Close")
            }
        },
    )
}

@Composable
private fun EmployeeStatCard(title: String, value: String, modifier: Modifier = Modifier) {
    val background by animateColorAsState(
        targetValue = MaterialTheme.colorScheme.surface,
        animationSpec = spring(stiffness = Spring.StiffnessMediumLow),
        label = "employee-stat-bg",
    )

    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = background),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
    ) {
        Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp)) {
            Text(title, style = MaterialTheme.typography.labelMedium)
            Text(value, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun DashboardErrorBanner(
    message: String,
    onRetry: () -> Unit,
    onDismiss: () -> Unit,
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.errorContainer,
            contentColor = MaterialTheme.colorScheme.onErrorContainer,
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text("Could not load employee data", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            Text(
                text = errorHint(message),
                style = MaterialTheme.typography.bodySmall,
            )
            Text(text = message, style = MaterialTheme.typography.bodySmall)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = onRetry) { Text("Retry") }
                Button(
                    onClick = onDismiss,
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                ) {
                    Text("Dismiss")
                }
            }
        }
    }
}

private fun errorHint(message: String): String {
    val lower = message.lowercase()
    return when {
        "http 500" in lower || "internal server error" in lower ->
            "Server error detected. Retry once, then share this message with your backend logs."

        "http 401" in lower || "unauthorized" in lower ->
            "Your session may have expired. Log out and log back in."

        "http 403" in lower || "forbidden" in lower ->
            "This request is blocked by permissions for your account."

        "network error" in lower || "unable to reach" in lower ->
            "Cannot connect to backend. Check backend server and emulator base URL."

        else -> "Request failed. Tap Retry to try again."
    }
}

private fun formatCurrency(amount: Double): String = "PHP ${"%,.2f".format(amount)}"
