pluginManagement {
    plugins {
        id("org.springframework.boot") version "3.1.1"
        id("io.spring.dependency-management") version "1.1.2"
        id("org.flywaydb.flyway") version "9.21.0"
        id("com.github.node-gradle.node") version "5.0.0"
    }
}

rootProject.name = "rare-basket"

include("backend", "frontend")
