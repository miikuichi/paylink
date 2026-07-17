package edu.cit.sevilla.paylink.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * CORS Configuration for PayLink API
 * 
 * Enables Cross-Origin Resource Sharing for web and mobile clients.
 * Configuration is environment-specific via application-{profile}.properties
 */
@Configuration
public class CorsConfig {

    @Value("${paylink.cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${paylink.cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS}")
    private String allowedMethods;

    @Value("${paylink.cors.allowed-headers:*}")
    private String allowedHeaders;

    @Value("${paylink.cors.max-age:3600}")
    private Long maxAge;

    @Value("${paylink.cors.allow-credentials:true}")
    private Boolean allowCredentials;

    /**
     * Configure CORS globally for all endpoints
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                List<String> originPatterns = parseCsv(allowedOrigins);
                List<String> methods = parseCsv(allowedMethods);
                List<String> headers = parseCsv(allowedHeaders);

                registry.addMapping("/api/**")
                        .allowedOriginPatterns(originPatterns.toArray(new String[0]))
                        .allowedMethods(methods.toArray(new String[0]))
                        .allowedHeaders(headers.toArray(new String[0]))
                        .allowCredentials(allowCredentials)
                        .maxAge(maxAge)
                        .exposedHeaders("X-Total-Count", "X-Page-Number", "X-Page-Size");
            }
        };
    }

    /**
     * Alternative CORS configuration source (can be used by Spring Security)
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(parseCsv(allowedOrigins));
        configuration.setAllowedMethods(parseCsv(allowedMethods));
        configuration.setAllowedHeaders(parseCsv(allowedHeaders));

        configuration.setAllowCredentials(allowCredentials);
        configuration.setMaxAge(maxAge);

        // Expose headers for pagination and other metadata
        configuration.setExposedHeaders(Arrays.asList(
                "X-Total-Count",
                "X-Page-Number",
                "X-Page-Size",
                "Content-Disposition"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    private List<String> parseCsv(String value) {
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(entry -> !entry.isEmpty())
                .collect(Collectors.toList());
    }
}
