pluginManagement {
    plugins {
        id("org.springframework.boot") version "3.3.1"
        id("io.spring.dependency-management") version "1.1.5"
        id("org.flywaydb.flyway") version "10.15.2"
        id("com.github.node-gradle.node") version "7.0.2"
    }
}

rootProject.name = "rare-basket"

include("backend", "frontend")
