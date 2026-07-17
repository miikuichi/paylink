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
                List<String> origins = Arrays.asList(allowedOrigins.split(","));
                List<String> methods = Arrays.asList(allowedMethods.split(","));

                registry.addMapping("/api/**")
                        .allowedOrigins(origins.toArray(new String[0]))
                        .allowedMethods(methods.toArray(new String[0]))
                        .allowedHeaders(allowedHeaders.split(","))
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
        
        // Parse allowed origins
        Arrays.stream(allowedOrigins.split(","))
              .map(String::trim)
              .forEach(configuration::addAllowedOrigin);
        
        // Parse allowed methods
        Arrays.stream(allowedMethods.split(","))
              .map(String::trim)
              .forEach(configuration::addAllowedMethod);
        
        // Parse allowed headers
        configuration.setAllowedHeaders(Arrays.asList(allowedHeaders.split(",")));
        
        configuration.setAllowCredentials(allowCredentials);
        configuration.setMaxAge(maxAge);
        
        // Expose headers for pagination and other metadata
        configuration.setExposedHeaders(Arrays.asList(
            "X-Total-Count",
            "X-Page-Number", 
            "X-Page-Size",
            "Content-Disposition"
        ));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
