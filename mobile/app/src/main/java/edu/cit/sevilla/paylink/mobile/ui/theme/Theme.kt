package edu.cit.sevilla.paylink.mobile.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val PayLinkColorScheme = lightColorScheme(
    primary = Gold500,
    onPrimary = Maroon900,
    secondary = Maroon600,
    onSecondary = SurfaceCard,
    tertiary = Maroon500,
    background = Cream50,
    onBackground = Ink900,
    surface = SurfaceCard,
    surfaceVariant = Cream100,
    onSurface = Ink900,
    outline = Ink100,
    error = Error,
    onError = SurfaceCard,
)

@Composable
fun PayLinkTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = PayLinkColorScheme,
        typography = Typography,
        content = content,
    )
}
