package edu.cit.sevilla.paylink.mobile.features.auth.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import edu.cit.sevilla.paylink.mobile.features.auth.data.model.Session
import edu.cit.sevilla.paylink.mobile.core.ui.theme.Cream100
import edu.cit.sevilla.paylink.mobile.core.ui.theme.Cream200
import edu.cit.sevilla.paylink.mobile.core.ui.theme.Gold500
import edu.cit.sevilla.paylink.mobile.core.ui.theme.Maroon800

@Composable
fun RegisterScreen(
    viewModel: AuthViewModel,
    onLoginClick: () -> Unit,
    onSuccess: (Session) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }

    LaunchedEffect(state.successSession) {
        state.successSession?.let {
            onSuccess(it)
            viewModel.consumeSuccess()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Cream100, Cream200)))
            .padding(18.dp),
        verticalArrangement = Arrangement.Center,
    ) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
            modifier = Modifier.fillMaxWidth(),
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Text(
                    "Create your account",
                    style = MaterialTheme.typography.headlineSmall,
                    color = Maroon800,
                    fontWeight = FontWeight.Bold,
                )

                OutlinedTextField(value = firstName, onValueChange = { firstName = it; viewModel.clearError() }, label = { Text("First name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = lastName, onValueChange = { lastName = it; viewModel.clearError() }, label = { Text("Last name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = email, onValueChange = { email = it; viewModel.clearError() }, label = { Text("Email") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = username, onValueChange = { username = it; viewModel.clearError() }, label = { Text("Username") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = password, onValueChange = { password = it; viewModel.clearError() }, label = { Text("Password") }, visualTransformation = PasswordVisualTransformation(), singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = confirmPassword, onValueChange = { confirmPassword = it; viewModel.clearError() }, label = { Text("Confirm password") }, visualTransformation = PasswordVisualTransformation(), singleLine = true, modifier = Modifier.fillMaxWidth())

                if (state.errorMessage.isNotBlank()) {
                    Text(
                        text = state.errorMessage,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall,
                    )
                }

                Button(
                    onClick = {
                        viewModel.register(
                            firstName = firstName,
                            lastName = lastName,
                            email = email,
                            username = username,
                            password = password,
                            confirmPassword = confirmPassword,
                            role = "EMPLOYEE",
                        )
                    },
                    enabled = !state.isLoading,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Gold500,
                        contentColor = Maroon800,
                    ),
                ) {
                    Text(if (state.isLoading) "Creating account..." else "Create Account")
                }

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
                    Text("Already have an account?")
                    TextButton(onClick = onLoginClick) {
                        Text("Sign in")
                    }
                }
            }
        }
    }
}
