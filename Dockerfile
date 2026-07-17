# Multi-stage Dockerfile for PayLink Backend
# 
# Build Stage: Compile Java application with Maven
# Runtime Stage: Run optimized JRE with minimal dependencies
#
# Usage:
#   docker build -t paylink-backend:latest .
#   docker run -p 8080:8080 \
#     -e SPRING_PROFILES_ACTIVE=production \
#     -e DB_HOST=db.example.com \
#     paylink-backend:latest

# Build stage - compile Java code
FROM eclipse-temurin:19-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper and project files
COPY backend/mvnw ./mvnw
COPY backend/.mvn ./.mvn
COPY backend/pom.xml .

# Download dependencies
RUN chmod +x ./mvnw && ./mvnw dependency:go-offline

# Copy source code
COPY backend/src ./src

# Build application (skip tests for faster build)
RUN ./mvnw clean package \
    -DskipTests \
    -Dspring.profiles.active=production \
    && ls -la target/

# Runtime stage - minimal JRE image
FROM eclipse-temurin:19-jre-alpine

LABEL maintainer="PayLink Team"
LABEL description="PayLink Backend API - Spring Boot Application"

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 paylink && \
    adduser -D -u 1001 -G paylink paylink

# Copy built JAR from builder stage
COPY --from=builder /build/target/paylink-*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/api/actuator/health || exit 1

# Set ownership
RUN chown -R paylink:paylink /app

# Switch to non-root user
USER paylink

# Run Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
