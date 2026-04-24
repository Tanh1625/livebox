# ==============================================================================
# Stage 1: Build Stage
# ==============================================================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy the pom.xml first to cache dependencies
COPY pom.xml .

# Download all dependencies (this layer will be cached unless pom.xml changes)
RUN mvn dependency:go-offline -B

# Copy the actual source code
COPY src ./src

# Build the application, skipping tests to speed up the container build process
RUN mvn clean package -DskipTests

# ==============================================================================
# Stage 2: Runtime Stage
# ==============================================================================
# DevOps Note: Upgraded from requested '17-jre-alpine' to '21-jre-alpine'.
# Your pom.xml specifies <java.version>21</java.version>. Running Java 21 bytecode 
# on a Java 17 JRE will cause an immediate 'UnsupportedClassVersionError' crash.
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create a non-root user and group for security (Standard security practice)
RUN addgroup -S livebox && adduser -S livebox -G livebox

# Copy the compiled JAR from the builder stage and assign ownership to non-root user
COPY --from=builder --chown=livebox:livebox /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Switch to the non-root user before running the application
USER livebox:livebox

# Add HEALTHCHECK endpoint
# IMPORTANT: This assumes spring-boot-starter-actuator is added to pom.xml.
# If you don't want to use actuator, change the path to an open API endpoint (e.g., /).
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health/ || exit 1

# Define the entry point for the container
ENTRYPOINT ["java", "-jar", "app.jar"]
