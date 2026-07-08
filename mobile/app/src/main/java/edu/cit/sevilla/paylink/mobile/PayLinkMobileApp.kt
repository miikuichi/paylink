package edu.cit.sevilla.paylink.mobile

import android.content.Context
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import edu.cit.sevilla.paylink.mobile.features.auth.data.model.Session
import edu.cit.sevilla.paylink.mobile.core.network.NetworkModule
import edu.cit.sevilla.paylink.mobile.features.auth.data.repository.AuthRepository
import edu.cit.sevilla.paylink.mobile.features.employees.data.repository.EmployeeRepository
import edu.cit.sevilla.paylink.mobile.features.payperiods.data.repository.PayPeriodRepository
import edu.cit.sevilla.paylink.mobile.features.payroll.data.repository.PayrollRepository
import edu.cit.sevilla.paylink.mobile.features.payslips.data.repository.PayslipRepository
import edu.cit.sevilla.paylink.mobile.core.session.SessionStore
import edu.cit.sevilla.paylink.mobile.core.navigation.NavRoutes
import edu.cit.sevilla.paylink.mobile.features.auth.ui.AuthViewModel
import edu.cit.sevilla.paylink.mobile.features.auth.ui.LoginScreen
import edu.cit.sevilla.paylink.mobile.features.auth.ui.RegisterScreen
import edu.cit.sevilla.paylink.mobile.features.employee_dashboard.ui.EmployeeDashboardScreen
import edu.cit.sevilla.paylink.mobile.features.employee_dashboard.ui.EmployeeDashboardViewModel
import edu.cit.sevilla.paylink.mobile.features.hr_dashboard.ui.HrDashboardScreen
import edu.cit.sevilla.paylink.mobile.features.hr_dashboard.ui.HrDashboardViewModel
import edu.cit.sevilla.paylink.mobile.core.ui.theme.PayLinkTheme

@Composable
fun PayLinkMobileApp(appContext: Context) {
    val sessionStore = remember { SessionStore(appContext) }
    val repository = remember {
        AuthRepository(
            authApi = NetworkModule.authApi,
            employeeApi = NetworkModule.employeeApi,
            sessionStore = sessionStore,
        )
    }

    val authViewModel: AuthViewModel = viewModel(
        factory = AuthViewModel.Factory(repository)
    )

    // Feature repositories for Employee and HR Dashboards
    val employeeRepository = remember { EmployeeRepository(NetworkModule.employeeApi) }
    val payPeriodRepository = remember { PayPeriodRepository(NetworkModule.payPeriodApi) }
    val payrollRepository = remember { PayrollRepository(NetworkModule.payrollApi) }
    val payslipRepository = remember { PayslipRepository(NetworkModule.payslipApi) }

    val employeeDashboardViewModel: EmployeeDashboardViewModel = viewModel(
        factory = EmployeeDashboardViewModel.Factory(
            employeeRepository,
            payrollRepository,
            payslipRepository,
        ),
    )
    val hrDashboardViewModel: HrDashboardViewModel = viewModel(
        factory = HrDashboardViewModel.Factory(
            employeeRepository,
            payPeriodRepository,
            payrollRepository,
            payslipRepository,
        ),
    )

    val navController = rememberNavController()
    val session by sessionStore.sessionFlow.collectAsStateWithLifecycle(initialValue = null)

    PayLinkTheme {
        NavHost(
            navController = navController,
            startDestination = NavRoutes.Splash,
        ) {
            composable(NavRoutes.Splash) {
                SplashRoute(
                    session = session,
                    navController = navController,
                )
            }
            composable(NavRoutes.Login) {
                LoginScreen(
                    viewModel = authViewModel,
                    onRegisterClick = { navController.navigate(NavRoutes.Register) },
                    onSuccess = { navigateByRole(navController, it) },
                )
            }
            composable(NavRoutes.Register) {
                RegisterScreen(
                    viewModel = authViewModel,
                    onLoginClick = { navController.navigate(NavRoutes.Login) },
                    onSuccess = { navigateByRole(navController, it) },
                )
            }
            composable(NavRoutes.EmployeeDashboard) {
                EmployeeDashboardScreen(
                    session = session ?: return@composable,
                    viewModel = employeeDashboardViewModel,
                    onLogout = {
                        authViewModel.logout {
                            navController.navigate(NavRoutes.Login) {
                                popUpTo(NavRoutes.Splash) { inclusive = true }
                                launchSingleTop = true
                            }
                        }
                    },
                )
            }
            composable(NavRoutes.HrDashboard) {
                HrDashboardScreen(
                    session = session ?: return@composable,
                    viewModel = hrDashboardViewModel,
                    onLogout = {
                        authViewModel.logout {
                            navController.navigate(NavRoutes.Login) {
                                popUpTo(NavRoutes.Splash) { inclusive = true }
                                launchSingleTop = true
                            }
                        }
                    },
                )
            }
        }
    }
}

@Composable
private fun SplashRoute(
    session: Session?,
    navController: NavHostController,
) {
    LaunchedEffect(session) {
        if (session?.token.isNullOrBlank()) {
            navController.navigate(NavRoutes.Login) {
                popUpTo(NavRoutes.Splash) { inclusive = true }
            }
            return@LaunchedEffect
        }

        if (session?.role == "ADMIN") {
            navController.navigate(NavRoutes.HrDashboard) {
                popUpTo(NavRoutes.Splash) { inclusive = true }
            }
        } else {
            navController.navigate(NavRoutes.EmployeeDashboard) {
                popUpTo(NavRoutes.Splash) { inclusive = true }
            }
        }
    }

    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator()
    }
}

private fun navigateByRole(
    navController: NavHostController,
    session: Session,
) {
    val target = if (session.role == "ADMIN") NavRoutes.HrDashboard else NavRoutes.EmployeeDashboard
    navController.navigate(target) {
        popUpTo(NavRoutes.Splash) { inclusive = true }
        launchSingleTop = true
    }
}
