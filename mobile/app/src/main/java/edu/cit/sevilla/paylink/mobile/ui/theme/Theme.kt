package edu.cit.sevilla.paylink.mobile.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val PayLinkColorScheme = darkColorScheme(
    primary = Gold500,
    onPrimary = Maroon900,
    secondary = Maroon600,
    onSecondary = SurfaceCard,
    background = Cream200,
    onBackground = Ink900,
    surface = SurfaceCard,
    onSurface = Ink900,
)

@Composable
fun PayLinkTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = PayLinkColorScheme,
        typography = Typography,
        content = content,
    )
}
