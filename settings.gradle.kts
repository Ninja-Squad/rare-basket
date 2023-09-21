pluginManagement {
    plugins {
        id("org.springframework.boot") version "3.1.4"
        id("io.spring.dependency-management") version "1.1.3"
        id("org.flywaydb.flyway") version "9.22.1"
        id("com.github.node-gradle.node") version "7.0.0"
    }
}

rootProject.name = "rare-basket"

include("backend", "frontend")
