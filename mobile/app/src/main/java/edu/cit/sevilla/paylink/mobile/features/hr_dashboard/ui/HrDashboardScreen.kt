package edu.cit.sevilla.paylink.mobile.features.hr_dashboard.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.horizontalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import edu.cit.sevilla.paylink.mobile.features.auth.data.model.Session
import edu.cit.sevilla.paylink.mobile.features.employees.data.model.CreateEmployeeRequest
import edu.cit.sevilla.paylink.mobile.features.payperiods.data.model.PayPeriodDto
import edu.cit.sevilla.paylink.mobile.features.payroll.data.model.PayrollDto
import edu.cit.sevilla.paylink.mobile.core.ui.theme.Cream100
import edu.cit.sevilla.paylink.mobile.core.ui.theme.Cream200
import edu.cit.sevilla.paylink.mobile.core.ui.theme.Gold100
import edu.cit.sevilla.paylink.mobile.core.ui.theme.Gold500
import edu.cit.sevilla.paylink.mobile.core.ui.theme.Maroon800

private val hrTabs = listOf("Overview", "Employees", "Payroll", "Payslips")

@Composable
fun HrDashboardScreen(
    session: Session,
    viewModel: HrDashboardViewModel,
    onLogout: () -> Unit,
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var selectedTab by remember { mutableIntStateOf(0) }

    var showAddEmployeeDialog by remember { mutableStateOf(false) }
    var showEditRateDialogForId by remember { mutableStateOf<Long?>(null) }
    var showAddPeriodDialog by remember { mutableStateOf(false) }

    LaunchedEffect(session.token) {
        viewModel.load(session.token)
    }

    val selectedPeriod = state.payPeriods.firstOrNull { it.id == state.selectedPeriodId }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Cream100, Cream200)))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Column {
                Text(
                    text = "HR Dashboard",
                    style = MaterialTheme.typography.headlineSmall,
                    color = Maroon800,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    text = selectedPeriod?.label ?: "No pay period selected",
                    style = MaterialTheme.typography.bodyMedium,
                )
            }

            Button(
                onClick = onLogout,
                colors = ButtonDefaults.buttonColors(containerColor = Gold500, contentColor = Maroon800),
            ) {
                Text("Log out")
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
            hrTabs.forEachIndexed { index, label ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(label) },
                )
            }
        }

        Crossfade(
            targetState = selectedTab,
            animationSpec = tween(durationMillis = 220),
            label = "hr-tab-crossfade",
        ) { tabIndex ->
            when (tabIndex) {
                0 -> HrOverviewTab(state)
                1 -> HrEmployeesTab(
                    state = state,
                    onAddEmployeeClick = { showAddEmployeeDialog = true },
                    onEditRateClick = { showEditRateDialogForId = it },
                )

                2 -> HrPayrollTab(
                    state = state,
                    onSelectPeriod = { viewModel.selectPeriod(session.token, it) },
                    onAddPeriodClick = { showAddPeriodDialog = true },
                    onRunPayroll = { viewModel.processPayroll(session.token, it) },
                    onGeneratePayslip = { viewModel.generatePayslip(session.token, it) },
                )

                else -> HrPayslipsTab(
                    state = state,
                    onSelectPeriod = { viewModel.selectPeriod(session.token, it) },
                    onAddPeriodClick = { showAddPeriodDialog = true },
                )
            }
        }
    }

    if (showAddEmployeeDialog) {
        CreateEmployeeDialog(
            onDismiss = {
                showAddEmployeeDialog = false
                viewModel.clearError()
            },
            onSubmit = { request ->
                viewModel.createEmployee(session.token, request)
                showAddEmployeeDialog = false
            },
        )
    }

    showEditRateDialogForId?.let { employeeId ->
        val employee = state.employees.firstOrNull { it.id == employeeId }
        if (employee != null) {
            EditRateDialog(
                employeeName = "${employee.firstName} ${employee.lastName}",
                initialValue = employee.basicRate,
                onDismiss = { showEditRateDialogForId = null },
                onSubmit = { newRate ->
                    viewModel.updateEmployeeRate(session.token, employeeId, newRate)
                    showEditRateDialogForId = null
                },
            )
        }
    }

    if (showAddPeriodDialog) {
        CreatePayPeriodDialog(
            onDismiss = { showAddPeriodDialog = false },
            onSubmit = { startDate, endDate ->
                viewModel.createPayPeriod(session.token, startDate, endDate)
                showAddPeriodDialog = false
            },
        )
    }
}

@Composable
private fun HrOverviewTab(state: HrDashboardState) {
    val activeEmployees = state.employees.count { it.status == "ACTIVE" }
    val totalNetPay = state.payrolls.sumOf { it.netPay }
    val processedCount = state.payrolls.count { it.status == "PROCESSED" }

    LazyColumn(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                HrStatCard("Active Employees", activeEmployees.toString(), Modifier.weight(1f))
                HrStatCard("Current Period Net", formatCurrency(totalNetPay), Modifier.weight(1f))
            }
        }
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                HrStatCard("Processed Payrolls", "$processedCount / ${state.payrolls.size}", Modifier.weight(1f))
                HrStatCard("Payslips Issued", state.payslips.size.toString(), Modifier.weight(1f))
            }
        }
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 5.dp),
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Quick Summary", fontWeight = FontWeight.Bold)
                    HorizontalDivider()
                    Text("Employees in roster: ${state.employees.size}")
                    Text("Pay periods created: ${state.payPeriods.size}")
                    Text("Payroll results in selected period: ${state.payrolls.size}")
                }
            }
        }
    }
}

@Composable
private fun HrEmployeesTab(
    state: HrDashboardState,
    onAddEmployeeClick: () -> Unit,
    onEditRateClick: (Long) -> Unit,
) {
    LazyColumn(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            Button(onClick = onAddEmployeeClick, modifier = Modifier.fillMaxWidth()) {
                Text("Add Employee")
            }
        }

        if (state.employees.isEmpty()) {
            item {
                Text(
                    "No employees yet.",
                    modifier = Modifier.padding(12.dp),
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                )
            }
        }

        items(state.employees, key = { it.id }) { employee ->
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("${employee.firstName} ${employee.lastName}", fontWeight = FontWeight.Bold)
                    Text("${employee.employeeNumber} · ${employee.status}")
                    Text("${employee.position ?: "No position"} · ${employee.department ?: "No department"}")
                    Text("Basic rate: ${formatCurrency(employee.basicRate ?: 0.0)}")
                    Button(onClick = { onEditRateClick(employee.id) }, modifier = Modifier.fillMaxWidth()) {
                        Text("Edit Basic Rate")
                    }
                }
            }
        }
    }
}

@Composable
private fun HrPayrollTab(
    state: HrDashboardState,
    onSelectPeriod: (Long) -> Unit,
    onAddPeriodClick: () -> Unit,
    onRunPayroll: (Long) -> Unit,
    onGeneratePayslip: (Long) -> Unit,
) {
    LazyColumn(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            PayPeriodSelector(
                payPeriods = state.payPeriods,
                selectedPeriodId = state.selectedPeriodId,
                onSelectPeriod = onSelectPeriod,
                onAddPeriodClick = onAddPeriodClick,
            )
        }

        if (state.payPeriods.isEmpty()) {
            item {
                Text("Create a pay period first to process payroll.", modifier = Modifier.padding(12.dp))
            }
        }

        items(state.employees.filter { it.status == "ACTIVE" }, key = { it.id }) { employee ->
            val existingPayroll = state.payrolls.firstOrNull { it.employeeId == employee.id }
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("${employee.firstName} ${employee.lastName}", fontWeight = FontWeight.Bold)
                    Text("${employee.employeeNumber} · Rate ${formatCurrency(employee.basicRate ?: 0.0)}")

                    if (existingPayroll == null) {
                        Button(
                            onClick = { onRunPayroll(employee.id) },
                            enabled = !state.busyIds.contains(employee.id) && state.selectedPeriodId != null,
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text(if (state.busyIds.contains(employee.id)) "Processing..." else "Run Payroll")
                        }
                    } else {
                        Text("Payroll: ${formatCurrency(existingPayroll.netPay)} (${existingPayroll.status})")
                        if (existingPayroll.hasPayslip) {
                            Text("Payslip already generated", color = MaterialTheme.colorScheme.primary)
                        } else {
                            Button(
                                onClick = { onGeneratePayslip(existingPayroll.id) },
                                enabled = !state.busyIds.contains(existingPayroll.id),
                                modifier = Modifier.fillMaxWidth(),
                            ) {
                                Text(if (state.busyIds.contains(existingPayroll.id)) "Generating..." else "Generate Payslip")
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun HrPayslipsTab(
    state: HrDashboardState,
    onSelectPeriod: (Long) -> Unit,
    onAddPeriodClick: () -> Unit,
) {
    LazyColumn(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            PayPeriodSelector(
                payPeriods = state.payPeriods,
                selectedPeriodId = state.selectedPeriodId,
                onSelectPeriod = onSelectPeriod,
                onAddPeriodClick = onAddPeriodClick,
            )
        }

        if (state.payslips.isEmpty()) {
            item {
                Text(
                    "No payslips generated for this period yet.",
                    modifier = Modifier.padding(12.dp),
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                )
            }
        }

        items(state.payslips, key = { it.id }) { payslip ->
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(payslip.employeeName, fontWeight = FontWeight.Bold)
                    Text(payslip.periodLabel)
                    Text("Gross: ${formatCurrency(payslip.grossPay)}")
                    Text("Deductions: ${formatCurrency(payslip.totalDeductions)}")
                    Text("Net: ${formatCurrency(payslip.netPay)}")
                }
            }
        }
    }
}

@Composable
private fun PayPeriodSelector(
    payPeriods: List<PayPeriodDto>,
    selectedPeriodId: Long?,
    onSelectPeriod: (Long) -> Unit,
    onAddPeriodClick: () -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Button(onClick = onAddPeriodClick, modifier = Modifier.fillMaxWidth()) {
            Text("Create Pay Period")
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            payPeriods.forEach { period ->
                val isSelected = selectedPeriodId == period.id
                Button(
                    onClick = { onSelectPeriod(period.id) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isSelected) Gold500 else MaterialTheme.colorScheme.surface,
                        contentColor = if (isSelected) Maroon800 else MaterialTheme.colorScheme.onSurface,
                    ),
                ) {
                    Text("${period.label} (${period.status})")
                }
            }
        }
    }
}

@Composable
private fun CreateEmployeeDialog(
    onDismiss: () -> Unit,
    onSubmit: (CreateEmployeeRequest) -> Unit,
) {
    var username by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var position by remember { mutableStateOf("") }
    var department by remember { mutableStateOf("") }
    var dateHired by remember { mutableStateOf("") }
    var basicRate by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Create Employee") },
        text = {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.size(320.dp, 420.dp)) {
                item { OutlinedTextField(value = username, onValueChange = { username = it }, label = { Text("Username") }) }
                item { OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") }) }
                item { OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Password") }) }
                item { OutlinedTextField(value = firstName, onValueChange = { firstName = it }, label = { Text("First name") }) }
                item { OutlinedTextField(value = lastName, onValueChange = { lastName = it }, label = { Text("Last name") }) }
                item { OutlinedTextField(value = position, onValueChange = { position = it }, label = { Text("Position") }) }
                item { OutlinedTextField(value = department, onValueChange = { department = it }, label = { Text("Department") }) }
                item { OutlinedTextField(value = dateHired, onValueChange = { dateHired = it }, label = { Text("Date hired (YYYY-MM-DD)") }) }
                item { OutlinedTextField(value = basicRate, onValueChange = { basicRate = it }, label = { Text("Basic rate") }) }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val rate = basicRate.toDoubleOrNull() ?: return@Button
                    onSubmit(
                        CreateEmployeeRequest(
                            username = username.trim(),
                            email = email.trim(),
                            password = password,
                            firstName = firstName.trim(),
                            lastName = lastName.trim(),
                            position = position.trim().ifBlank { null },
                            department = department.trim().ifBlank { null },
                            dateHired = dateHired.trim().ifBlank { null },
                            basicRate = rate,
                        ),
                    )
                },
            ) {
                Text("Save")
            }
        },
        dismissButton = { Button(onClick = onDismiss) { Text("Cancel") } },
    )
}

@Composable
private fun EditRateDialog(
    employeeName: String,
    initialValue: Double?,
    onDismiss: () -> Unit,
    onSubmit: (Double) -> Unit,
) {
    var rate by remember { mutableStateOf((initialValue ?: 0.0).toString()) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Edit Rate") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(employeeName)
                OutlinedTextField(
                    value = rate,
                    onValueChange = { rate = it },
                    label = { Text("Basic Rate") },
                )
            }
        },
        confirmButton = {
            Button(onClick = {
                val parsed = rate.toDoubleOrNull() ?: return@Button
                onSubmit(parsed)
            }) {
                Text("Update")
            }
        },
        dismissButton = { Button(onClick = onDismiss) { Text("Cancel") } },
    )
}

@Composable
private fun CreatePayPeriodDialog(
    onDismiss: () -> Unit,
    onSubmit: (String, String) -> Unit,
) {
    var startDate by remember { mutableStateOf("") }
    var endDate by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Create Pay Period") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = startDate, onValueChange = { startDate = it }, label = { Text("Start date (YYYY-MM-DD)") })
                OutlinedTextField(value = endDate, onValueChange = { endDate = it }, label = { Text("End date (YYYY-MM-DD)") })
            }
        },
        confirmButton = {
            Button(onClick = { onSubmit(startDate.trim(), endDate.trim()) }) {
                Text("Create")
            }
        },
        dismissButton = { Button(onClick = onDismiss) { Text("Cancel") } },
    )
}

@Composable
private fun HrStatCard(title: String, value: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
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
            Text("Request failed", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
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
            "This specific request is blocked by permissions for your account."

        "network error" in lower || "unable to reach" in lower ->
            "Cannot connect to backend. Verify backend is running and API base URL is correct."

        else -> "Request failed. Tap Retry to try again."
    }
}

private fun formatCurrency(amount: Double): String = "PHP ${"%,.2f".format(amount)}"
