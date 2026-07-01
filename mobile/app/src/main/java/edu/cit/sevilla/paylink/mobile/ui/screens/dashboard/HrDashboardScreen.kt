package edu.cit.sevilla.paylink.mobile.ui.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import edu.cit.sevilla.paylink.mobile.data.model.Session
import edu.cit.sevilla.paylink.mobile.ui.theme.Cream100
import edu.cit.sevilla.paylink.mobile.ui.theme.Cream200
import edu.cit.sevilla.paylink.mobile.ui.theme.Gold500
import edu.cit.sevilla.paylink.mobile.ui.theme.Maroon800

@Composable
fun HrDashboardScreen(
    session: Session,
    onLogout: () -> Unit,
) {
    val name = session.firstName.ifBlank { session.username }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Cream100, Cream200)))
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Text(
            text = "Hello, $name",
            style = MaterialTheme.typography.headlineSmall,
            color = Maroon800,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = "HR / Admin dashboard",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground,
        )

        HrMetricCard(title = "Total Employees", value = "Manage via web/desktop admin")
        HrMetricCard(title = "Payroll Operations", value = "Ready for processing")
        HrMetricCard(title = "Role", value = session.role)

        Spacer(modifier = Modifier.height(8.dp))

        Button(
            onClick = onLogout,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = Gold500,
                contentColor = Maroon800,
            ),
        ) {
            Text("Log out", fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun HrMetricCard(title: String, value: String) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(title, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
                Spacer(modifier = Modifier.height(4.dp))
                Text(value, color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Bold)
            }
        }
    }
}
