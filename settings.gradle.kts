pluginManagement {
    plugins {
        id("org.springframework.boot") version "3.1.5"
        id("io.spring.dependency-management") version "1.1.4"
        id("org.flywaydb.flyway") version "10.0.1"
        id("com.github.node-gradle.node") version "7.0.1"
    }
}

rootProject.name = "rare-basket"

include("backend", "frontend")
